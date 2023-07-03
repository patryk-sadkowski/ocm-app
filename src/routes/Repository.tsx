import {
  ArrowRightIcon,
  DownloadIcon,
  ExternalLinkIcon,
  QuestionIcon,
} from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Flex,
  Heading,
  Select,
  Skeleton,
  Stack,
  StackDivider,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useReducer, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import {
  fetchAllItemsOfTypeFromRepositoryIdScroll,
  fetchItemByID,
  getReferencedByForAsset,
} from "../services/assets.service";
import {
  mapImagesDataForExcel,
  mapPagesDataForExcel,
} from "../services/excel.service";
import { saveJSONToExcelFile } from "../services/files.service";
import {
  getSites,
  getSiteVanityDomain,
  getStructureJSON,
  SiteI,
} from "../services/sites.service";
import { getAllTypes } from "../services/types.service";
import { ItemI } from "../types/repositories";
import { AssetTypeI } from "../types/types";

interface LoadingStates {
  pages: boolean;
  images: boolean;
  types: boolean;
}

const server = localStorage.getItem("server")?.toLowerCase();

const Repository = () => {
  const [assetsWithTooLongFieldValue, setAssetsWithTooLongFieldValue] =
    useState<
      {
        id?: string;
        name?: string;
        fieldName?: string;
        [key: string]: any;
      }[]
    >([]);
  const [imageProgress, setImageProgress] = useState("");
  const [pagesProgress, setPagesProgress] = useState("");
  const [loadingStates, setLoading] = useReducer(
    (state: LoadingStates, newState: Partial<LoadingStates>) => ({
      ...state,
      ...newState,
    }),
    {
      pages: false,
      images: false,
      types: false,
    }
  );

  const [availableAssetTypes, setAvailableAssetTypes] = useState<AssetTypeI[]>(
    []
  );
  const [searchParams] = useSearchParams();
  const repositoryId = searchParams.get("id");
  const repositoryName = searchParams.get("name");
  const [assets, setAssets] = useState<ItemI[]>([]);
  const [shouldGenerateURLs, setShouldGenerateURLs] = useState(false);
  const [sites, setSites] = useState<SiteI[]>([]);
  const [activeSite, setActiveSite] = useState<SiteI>();
  const toast = useToast();
  const [includeTeaserData, setIncludeTeaserData] = useState(false);
  const [includeReferencedBy, setIncludeReferencedBy] = useState(false);
  const [simultaneousRequests, setSimultaneousRequests] = useState(15);
  const [excludeUnused, setExludeUnused] = useState(false);

  const downloadImages = async () => {
    const imageTypesOnly = availableAssetTypes.filter((assetType: AssetTypeI) =>
      assetType.name.toLowerCase().includes("image")
    );

    setLoading({
      images: true,
    });

    try {
      await downloadExcel(imageTypesOnly, `images-${repositoryName}`, "images");
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not fetch pages",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }

    setLoading({
      images: false,
    });
  };

  const downloadPages = async () => {
    const pagesTypesOnly = availableAssetTypes.filter((assetType: AssetTypeI) =>
      assetType.name.toLowerCase().includes("page")
    );
    setLoading({
      pages: true,
    });
    try {
      await downloadExcel(pagesTypesOnly, `pages-${repositoryName}`);
    } catch (err) {
      toast({
        title: "Error",
        description:
          "There was an error during Excel generation. Open console log (F12) to see more info.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }

    setLoading({
      pages: false,
    });
  };

  const getPagesDataForExcel = async (assetsToDownload: AssetTypeI[]) => {
    if (!repositoryId || !repositoryName || !activeSite) {
      return;
    }

    const typesNamesToDownload = assetsToDownload.map((type) => type.name);

    const assetsRes = await fetchAllItemsOfTypeFromRepositoryIdScroll(
      repositoryId,
      availableAssetTypes
        .filter((type) => typesNamesToDownload.includes(type.name))
        .map((type) => type.name),
      setPagesProgress
    );

    const siteVanityDomain = await getSiteVanityDomain(
      activeSite?.id,
      activeSite?.name
    );

    const structurePages = await getStructureJSON(siteVanityDomain);
    if (structurePages.length < 1) {
      toast({
        title: "Warning",
        description:
          "Could not fetch the structure (probableUrl will not be generated). Was the site published?",
        status: "warning",
        duration: null,
        isClosable: true,
      });
    }

    const mappedPages = mapPagesDataForExcel(assetsRes, repositoryName, {
      structurePages,
      baseURL: siteVanityDomain,
    });

    if (includeTeaserData) {
      let mappedPagesWithTeaserMedia = [];
      for (const page of mappedPages) {
        if (!page.teaser_media_id) {
          mappedPagesWithTeaserMedia.push(page);
          continue;
        }

        setPagesProgress(`Teaser - Page ${page.name}`);
        const teaserMedia = await fetchItemByID(page.teaser_media_id);
        if (teaserMedia?.name) {
          mappedPagesWithTeaserMedia.push({
            ...page,
            teaser_media_name: teaserMedia.name,
          });
          continue;
        }

        mappedPagesWithTeaserMedia.push(page);
      }

      return mappedPagesWithTeaserMedia;
    }

    return mappedPages;
  };

  type ArrayElementType<T> = T extends Array<infer U> ? U : never;

  const downloadExcel = async (
    assetsToDownload: AssetTypeI[],
    fileName: string,
    dataType: "pages" | "images" = "pages"
  ) => {
    setAssetsWithTooLongFieldValue([]);
    setPagesProgress("");
    setImageProgress("");

    if (!repositoryId || !repositoryName || !activeSite) {
      return;
    }

    if (dataType === "pages") {
      const pagesData = await getPagesDataForExcel(assetsToDownload);
      setPagesProgress("");
      // create a const of type one item from pagesData, not array

      const pagesWithTooLongField: (
        | ArrayElementType<typeof pagesData>
        | { fieldName: string }
      )[] = [];
      let alerted = false;
      const filteredPagesData = pagesData?.filter((page) => {
        const pageHasTooLongField = Object.keys(page).some((key) => {
          const value = (page as any)[key];
          if (typeof value === "string" && value.length > 32767) {
            if (!alerted) {
              toast({
                title: "Warning",
                description: `Some pages have fields with more than 32767 characters. They will be not included in the Excel file.`,
                status: "warning",
                duration: null,
                isClosable: true,
              });
            }
            alerted = true;
            pagesWithTooLongField.push({ ...page, fieldName: key });
            return true;
          }
          return false;
        });
        setAssetsWithTooLongFieldValue(pagesWithTooLongField);
        return !pageHasTooLongField;
      });

      return saveJSONToExcelFile(filteredPagesData, `${fileName}.xlsx`);
    }

    const typesNamesToDownload = assetsToDownload.map((type) => type.name);
    const assetsRes = await fetchAllItemsOfTypeFromRepositoryIdScroll(
      repositoryId,
      availableAssetTypes
        .filter((type) => typesNamesToDownload.includes(type.name))
        .map((type) => type.name),
      setImageProgress
    );

    if (!assetsRes) {
      throw new Error("No assets");
    }
    console.log("IMAGES", assetsRes);

    const isImagesRequest = typesNamesToDownload.find((typeName) =>
      typeName.toLowerCase().includes("image")
    );

    if (isImagesRequest) {
      const preparedAssets = mapImagesDataForExcel(assetsRes, repositoryName);

      if (includeReferencedBy) {
        const referencedByData = await getReferencedBy(
          preparedAssets,
          setImageProgress,
          simultaneousRequests
        );

        console.log("REFERENCED BY DATA", referencedByData);

        const mappedPreparedAssets = referencedByData.flatMap((asset) => {
          const assetInPreparedAssets = preparedAssets.find(
            (a) => a.id === asset.id
          );

          return asset.referencedBy.map((referencedBy) => {
            return {
              ...assetInPreparedAssets,
              referenced_by_id: referencedBy.id,
              referenced_by_name: referencedBy.name,
              referenced_by_language: referencedBy.language,
              referenced_by_type: referencedBy.type
            };
          });
        });

        const preparedAssetsWithoutReferencedBy = preparedAssets.filter(
          (asset) =>
            mappedPreparedAssets.find((a) => a.id === asset.id) === undefined
        );
        const combined = [
          ...preparedAssetsWithoutReferencedBy,
          ...mappedPreparedAssets,
        ];

        console.log("BOOO", combined);
        setImageProgress("");
        return saveJSONToExcelFile(
          excludeUnused ? mappedPreparedAssets : combined,
          `${fileName}.xlsx`
        );
      }

      setImageProgress("");
      return saveJSONToExcelFile(preparedAssets, `${fileName}.xlsx`);
    }

    // Not images request
    const siteVanityDomain = await getSiteVanityDomain(
      activeSite?.id,
      activeSite?.name
    );
    const structurePages = await getStructureJSON(siteVanityDomain).catch(
      (_err) => {
        return [];
      }
    );

    if (structurePages.length < 1) {
      toast({
        title: "Warning",
        description:
          "Could not fetch the structure (probableUrl will not be generated). Was the site published?",
        status: "warning",

        isClosable: true,
      });
    }

    const preparedAssets = mapPagesDataForExcel(assetsRes, repositoryName, {
      structurePages,
      baseURL: siteVanityDomain,
    });
    return saveJSONToExcelFile(preparedAssets, `${fileName}.xlsx`);
  };

  const getAvailableAssetTypesAndSites = useCallback(async () => {
    setLoading({
      types: true,
    });
    if (availableAssetTypes.length > 0) {
      setLoading({
        types: false,
      });
      return;
    }
    const sites = await getSites();
    const assetTypesRes = await getAllTypes();
    if (!assetTypesRes) {
      toast({
        title: "Error",
        description: "Could not fetch asset types",
        status: "error",
        duration: 9000,
        isClosable: true,
      });

      setLoading({
        types: false,
      });
      return;
    }

    if (!sites) {
      toast({
        title: "Error",
        description: "Could not fetch sites",
        status: "error",
        duration: 9000,
        isClosable: true,
      });

      setLoading({
        types: false,
      });
      return;
    }
    setSites(sites.items);
    if (repositoryName) {
      const foundSite = sites.items.find((site) =>
        repositoryName.toLowerCase().includes(site.name.toLowerCase())
      );
      setActiveSite(foundSite);
    }

    console.log(sites);
    setAvailableAssetTypes(assetTypesRes);
    
    setLoading({
      types: false,
    });
  }, [availableAssetTypes.length, toast]);

  useEffect(() => {
    if (!loadingStates.types || availableAssetTypes.length < 1) {
      getAvailableAssetTypesAndSites();
    }
  }, [
    getAvailableAssetTypesAndSites,
    availableAssetTypes.length,
    loadingStates.types,
  ]);

  return (
    <Box padding={4} maxW={800} margin="auto">
      <Heading size="md" marginBottom={4}>
        Repository: {repositoryName}
      </Heading>
      <Card variant="outline">
        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Box>
              <Heading size="xs" textTransform="uppercase">
                Page-related assets
              </Heading>
              <Skeleton isLoaded={!loadingStates.types}>
                <Text pt="2" fontSize="sm" color="gray">
                  All assets of type:{" "}
                  {availableAssetTypes
                    .filter((assetType: AssetTypeI) =>
                      assetType.name.toLowerCase().includes("page")
                    )
                    .map((availableType) => availableType.name)
                    .join(", ")}
                </Text>
              </Skeleton>

              <Flex
                direction="row"
                alignItems="center"
                gap={4}
                marginTop={4}
                flexDirection={{
                  base: "column",
                  md: "row",
                }}
              >
                <Button
                  leftIcon={<DownloadIcon />}
                  isDisabled={loadingStates.types}
                  onClick={downloadPages}
                  isLoading={loadingStates.pages}
                  loadingText={pagesProgress}
                >
                  Download Pages
                </Button>

                <Button
                  gap={4}
                  variant="outline"
                  disabled={loadingStates.pages}
                >
                  <Checkbox
                    isChecked={includeTeaserData}
                    onChange={(e) => setIncludeTeaserData(e.target.checked)}
                  />{" "}
                  Include teaser data
                </Button>

                <Skeleton isLoaded={sites.length > 0}>
                  <Select
                    placeholder="Select website"
                    maxW={200}
                    disabled={loadingStates.pages}
                    value={activeSite?.id}
                    onChange={(e) =>
                      setActiveSite(
                        sites.find((site) => site.id === e.target.value)
                      )
                    }
                  >
                    {sites
                      .sort((a, b) => {
                        // sort alphabetically
                        if (a.name < b.name) {
                          return -1;
                        }
                        if (a.name > b.name) {
                          return 1;
                        }

                        return 0;
                      })
                      .map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                  </Select>
                </Skeleton>

                <Tooltip label="Select website if it was detected incorrectly.">
                  <QuestionIcon />
                </Tooltip>
              </Flex>
            </Box>
            <Box>
              <Heading size="xs" textTransform="uppercase">
                Image assets
              </Heading>
              <Skeleton isLoaded={!loadingStates.types}>
                <Text pt="2" fontSize="sm" color="gray">
                  All assets of type:{" "}
                  {availableAssetTypes
                    .filter((assetType: AssetTypeI) =>
                      assetType.name.toLowerCase().includes("image")
                    )
                    .map((availableType) => availableType.name)
                    .join(", ")}
                </Text>
              </Skeleton>
              <Flex
                alignItems="center"
                gap={4}
                marginTop={4}
                flexDirection={{
                  base: "column",
                  md: "row",
                }}
              >
                <Button
                  leftIcon={<DownloadIcon />}
                  isDisabled={loadingStates.types}
                  onClick={downloadImages}
                  isLoading={loadingStates.images}
                  loadingText={imageProgress}
                  width={{
                    base: "100%",
                    md: "auto",
                  }}
                >
                  Download Images
                </Button>
                <Button
                  gap={4}
                  variant="outline"
                  isDisabled={loadingStates.types || loadingStates.images}
                  width={{
                    base: "100%",
                    md: "auto",
                  }}
                >
                  <Checkbox
                    isChecked={includeReferencedBy}
                    onChange={(e) => setIncludeReferencedBy(e.target.checked)}
                  />
                  <div>
                    Include <i>referenced by</i>
                  </div>
                </Button>
                <Button
                  width={{
                    base: "100%",
                    md: "auto",
                  }}
                  gap={4}
                  variant="outline"
                  isDisabled={
                    loadingStates.types ||
                    loadingStates.images ||
                    !includeReferencedBy
                  }
                >
                  <Checkbox
                    isChecked={excludeUnused}
                    onChange={(e) => setExludeUnused(e.target.checked)}
                  />
                  <div>Exclude unused</div>
                </Button>
                <Select
                  width={{
                    base: "100%",
                    md: "auto",
                  }}
                  isDisabled={loadingStates.types || !includeReferencedBy}
                  maxW={85}
                  value={simultaneousRequests}
                  onChange={(e) =>
                    setSimultaneousRequests(Number(e.target.value))
                  }
                >
                  <option value={1}>1</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={150}>150</option>
                  <option value={300}>300</option>
                </Select>
                <Tooltip label="Change the number of simultaneous requests (referenced by).">
                  <QuestionIcon />
                </Tooltip>
              </Flex>
            </Box>
          </Stack>
        </CardBody>
      </Card>

      {assetsWithTooLongFieldValue.length > 0 && (
        <Box marginTop={4}>
          <Alert status="warning">
            <AlertIcon />
            <AlertTitle mr={2}>
              Some assets have too long field values
            </AlertTitle>
            <AlertDescription>
              <Text fontSize="sm">
                Some assets have too long field values and cannot be exported.
                Please check the following assets:
              </Text>
            </AlertDescription>
          </Alert>
          <Table border="2px solid" marginTop={4} borderColor="orange.300">
            <Thead>
              <Tr>
                <Th>Asset name</Th>
                <Th>ID</Th>
                <Th>Field name</Th>
              </Tr>
            </Thead>
            <Tbody>
              {assetsWithTooLongFieldValue.map((asset) => {
                const assetUrl = `https://${server}-iroraclecloud.cec.ocp.oraclecloud.com/documents/assets?q=%7B%22keywords%22%3A%5B%22${asset.id}%22%5D%2C%22repositoryId%22%3A%22${repositoryId}%22%7D`;

                return (
                  <Tr key={asset.id}>
                    <Td>
                      <Link to={assetUrl} target="_blank">
                        {asset.name} <ExternalLinkIcon />
                      </Link>
                    </Td>

                    <Td>{asset.id}</Td>
                    <Td>{asset.fieldName}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}

      <Button
        size="sm"
        variant="outline"
        float="right"
        marginTop={4}
        leftIcon={<ArrowRightIcon w={2} h={2} />}
      >
        <Link to="/assets-import">Assets Import</Link>
      </Button>
    </Box>
  );
};

const ReferencedBySchema = z.array(
  z
    .object({
      id: z.string(),
      relationships: z
        .object({
          data: z
            .object({
              referencedBy: z.array(
                z
                  .object({
                    id: z.string(),
                  })
                  .passthrough()
              ),
            })
            .passthrough(),
        })
        .passthrough(),
    })
    .passthrough()
);

const getReferencedBy = async (
  preparedAssets: ReturnType<typeof mapImagesDataForExcel>,
  setImageProgress: (progressStr: string) => void,
  numberOfSimultaneousRequests = 5
) => {
  let requests = [];
  let completedRequests = 0;
  let totalAssets = preparedAssets.length;
  let results: ReturnType<(typeof ReferencedBySchema)["parse"]> = [];
  let count = 0;
  setImageProgress(`Referenced by: ${completedRequests}/${totalAssets}`);

  for (const asset of preparedAssets) {
    count = count + 1;
    requests.push(getReferencedByForAsset(asset.id));

    if (requests.length === numberOfSimultaneousRequests) {
      let responses = await Promise.all(requests);
      const reponsesParsed = ReferencedBySchema.parse(responses);
      results = results.concat(reponsesParsed);
      completedRequests += requests.length;
      setImageProgress(`Referenced by: ${completedRequests}/${totalAssets}`);
      requests = [];
    }
  }

  // handle any remaining requests
  if (requests.length > 0) {
    let responses = await Promise.all(requests);
    const reponsesParsed = ReferencedBySchema.parse(responses);
    results = results.concat(reponsesParsed);
    completedRequests += requests.length;
    setImageProgress(`${completedRequests}/${totalAssets}`);
  }

  // RESULTS

  const expandedReferences = await expandReferences(
    results,
    setImageProgress,
    numberOfSimultaneousRequests
  );

  return expandedReferences;
};

const expandReferences = async (
  assets: ReturnType<(typeof ReferencedBySchema)["parse"]>,
  setProgress: (progressStr: string) => void,
  numberOfSimultaneousRequests = 5
) => {
  // use fetchItemByID to get the full asset data, use numberOfSimultaneousRequests to set the number of simultaneous requests
  const ResponseSchema = z.array(
    z
      .object({
        id: z.string(),
        name: z.string(),
        language: z.string(),
        type: z.string(),
      })
      .passthrough()
  );

  let requests = [];
  let completedRequests = 0;
  let results: ReturnType<(typeof ResponseSchema)["parse"]> = [];

  const allReferencedAssetsIds = assets.flatMap((asset) =>
    asset.relationships.data.referencedBy.map(
      (referencedAsset) => referencedAsset.id
    )
  );

  const uniqueReferencedAssetsIds = [...new Set(allReferencedAssetsIds)];
  let totalAssets = uniqueReferencedAssetsIds.length;
  setProgress(`Expanding references: ${completedRequests}/${totalAssets}`);

  for (const referencedAssetId of uniqueReferencedAssetsIds) {
    requests.push(fetchItemByID(referencedAssetId));

    if (requests.length === numberOfSimultaneousRequests) {
      let responses = await Promise.all(requests);
      const reponsesParsed = ResponseSchema.parse(responses);
      results = results.concat(reponsesParsed);
      completedRequests += requests.length;
      setProgress(`Expanding references: ${completedRequests}/${totalAssets}`);
      requests = [];
    }
  }

  // handle any remaining requests
  if (requests.length > 0) {
    let responses = await Promise.all(requests);
    const reponsesParsed = ResponseSchema.parse(responses);
    results = results.concat(reponsesParsed);
    completedRequests += requests.length;
    setProgress(`Expanding references: ${completedRequests}/${totalAssets}`);
  }

  // RESULTS

  const mappedData = assets.map((asset) => {
    const referencedBy = asset.relationships.data.referencedBy.map(
      (referencedAsset) => {
        const foundAsset = results.find(
          (result) => result.id === referencedAsset.id
        );

        return {
          id: foundAsset?.id,
          name: foundAsset?.name,
          language: foundAsset?.language,
          type: foundAsset?.type
        };
      }
    );

    return {
      id: asset.id,
      name: asset.name || "N/A",
      referencedBy,
    };
  });

  return mappedData;
};

export default Repository;
