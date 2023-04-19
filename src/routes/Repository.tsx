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
  Flex,
  Heading,
  List,
  ListItem,
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
import { fetchAllItemsOfTypeFromRepositoryIdScroll } from "../services/assets.service";
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

    return mapPagesDataForExcel(assetsRes, repositoryName, {
      structurePages,
      baseURL: siteVanityDomain,
    });
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

    const siteVanityDomain = await getSiteVanityDomain(
      activeSite?.id,
      activeSite?.name
    );
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
    console.log("ASSETS", assetsRes);

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
    const preparedAssets = typesNamesToDownload.find((typeName) =>
      typeName.toLowerCase().includes("image")
    )
      ? mapImagesDataForExcel(assetsRes, repositoryName)
      : mapPagesDataForExcel(assetsRes, repositoryName, {
          structurePages,
          baseURL: siteVanityDomain,
        });

    saveJSONToExcelFile(preparedAssets, `${fileName}.xlsx`);
    setImageProgress("");
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

              <Flex direction="row" alignItems="center" gap={4} marginTop={4}>
                <Button
                  leftIcon={<DownloadIcon />}
                  isDisabled={loadingStates.types}
                  onClick={downloadPages}
                  isLoading={loadingStates.pages}
                  loadingText={pagesProgress}
                >
                  Download Pages
                </Button>

                <Skeleton isLoaded={sites.length > 0}>
                  <Select
                    placeholder="Select website"
                    maxW={200}
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
              <Button
                marginTop={4}
                leftIcon={<DownloadIcon />}
                isDisabled={loadingStates.types}
                onClick={downloadImages}
                isLoading={loadingStates.images}
                loadingText={imageProgress}
              >
                Download Images
              </Button>
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

export default Repository;
