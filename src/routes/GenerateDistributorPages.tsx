import { CloseIcon, QuestionIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Flex,
  Heading,
  Link,
  Spinner,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
  Select,
} from "@chakra-ui/react";
import { Fragment, useCallback, useMemo, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useSearchParams } from "react-router-dom";
import { publishItemById } from "../services/bulk.service";
import {
  EMPTY_DISTRIBUTOR_NAME_STRING,
  getMappedDistributorPages,
  importDistributorPageToOcm,
} from "../services/distributorPages.service";
import { readExcelFile } from "../services/files.service";
import { getAllChannels } from "../services/channel.service";

type Status = "LOADING" | "PUBLISHED" | "ERROR" | "IMPORTED";

const server = localStorage.getItem("server")?.toLowerCase();

const GenerateDistributorPages = () => {
  const [isLoading, setIsLoading] = useState(false);
  // const [isFailedAssetsRemovalLoading, setFailedAssetsRemovalLoading] =
  //   useState(false);
  const toast = useToast();
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [pagesStates, setPagesStates] = useState<{
    [internalId: string]: Status;
  }>({});
  const [searchParams] = useSearchParams();
  const repositoryId = searchParams.get("id");
  const repositoryName = searchParams.get("name");
  const [excelFileName, setExcelFileName] = useState<null | string>(null);
  const [mappedExcelData, setMappedExcelData] = useState<null | ReturnType<
    typeof getMappedDistributorPages
  >>(null);
  const [failedAssetsIds, setFailedAssetsIds] = useState<string[]>([]);
  const [publishAfterImport, setPublishAfterImport] = useState(false);
  const [errors, setErrors] = useState<{ assetName: string; error: string }[]>(
    []
  );

  const failedAssetsLinks = useMemo(() => {
    if (!failedAssetsIds.length) {
      return [];
    }

    const firstUrlChunk =
      "https://ircxdev01-iroraclecloud.cec.ocp.oraclecloud.com/documents/assets?q=%7B%22keywords%22%3A%5B%22";
    const lastUrlChunk = `%22%5D%2C%22repositoryId%22%3A%22${repositoryId}%22%7D`;

    const baseUrl = `https://${server}-iroraclecloud.cec.ocp.oraclecloud.com/documents/assets?q=%7B%22repositoryId%22%3A%22${repositoryId}%22%2C%22keywords%22%3A%5B%22`;
    const baseUrlLength = (firstUrlChunk + lastUrlChunk).length;
    const maxUrlLength = 2000;

    const singleIdLength = failedAssetsIds[0].length;
    const maxIds = Math.floor((maxUrlLength - baseUrlLength) / singleIdLength);
    const URLs = [];

    for (let i = 0; i < failedAssetsIds.length; i += maxIds) {
      const idsChunk = failedAssetsIds.slice(i, i + maxIds);
      const idsChunkString = idsChunk.join("%22%2C%22");
      const url = `${firstUrlChunk}${idsChunkString}${lastUrlChunk}`;
      URLs.push(url);
    }

    return URLs;
  }, [failedAssetsIds, repositoryId]);

  const getChannels = async () => {
    try {
      const channels = await getAllChannels();
      if (repositoryName) {
        const channelGuess = channels.items.find(
          (channel: { name: string; id: string }) =>
            channel.name.toLowerCase().includes(repositoryName.toLowerCase())
        );

        channelGuess && setSelectedChannel(channelGuess);
      }

      setChannels(channels.items);
    } catch (err: any) {
      toast({
        title: "Error",
        description: `An error occured while fetching channels. ${err.message}`,
        status: "error",
        duration: null,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    getChannels();
  }, []);

  const addError = (err?: { assetName: string; error: string }) => {
    if (!err) return;
    setErrors((prevState) => [...prevState, err]);
  };

  const startGenerating = async () => {
    if (!mappedExcelData || !repositoryId || !selectedChannel) {
      return null;
    }

    setFailedAssetsIds([]);
    setErrors([]);

    setIsLoading(true);

    for (const mappedDistributorPage of mappedExcelData) {
      setPagesStates((prevState) => ({
        ...prevState,
        [mappedDistributorPage.internalId]: "LOADING",
      }));

      const { distributorPageId, addressesOcmIds, error } =
        await importDistributorPageToOcm({
          distributorPage: mappedDistributorPage,
          repositoryId: repositoryId,
          language: "en",
          channelId: selectedChannel.id,
        });

      if (distributorPageId) {
        setPagesStates((prevState) => ({
          ...prevState,
          [mappedDistributorPage.internalId]: "IMPORTED",
        }));

        if (publishAfterImport) {
          try {
            // publish addresses first
            for (const address of addressesOcmIds) {
              await publishItemById(address.id);
            }

            await publishItemById(distributorPageId);
            setPagesStates((prevState) => ({
              ...prevState,
              [mappedDistributorPage.internalId]: "PUBLISHED",
            }));
          } catch (err: any) {
            addError({
              assetName: mappedDistributorPage.assetName,
              error:
                (err.response?.data as { detail: string }).detail ||
                err.message,
            });
            toast({
              title: "Error",
              description: `An error occured while publishing. Distributor page: ${distributorPageId}`,
              status: "error",
              duration: null,
              isClosable: true,
            });
          }
        }
      } else {
        error &&
          addError({
            assetName: mappedDistributorPage.assetName,
            error:
              (error.response?.data as { detail: string }).detail ||
              error.message,
          });
        setFailedAssetsIds((prevState) => [
          ...prevState,
          ...addressesOcmIds.map((address) => address.id),
        ]);

        setPagesStates((prevState) => ({
          ...prevState,
          [mappedDistributorPage.internalId]: "ERROR",
        }));
      }
    }

    toast({
      title: "Import done",
      description: "Location pages import has been finished.",
      status: "info",
      duration: null,
      isClosable: true,
    });

    setIsLoading(false);
  };

  /** DOESN'T WORK */
  // const removeFailedAssets = async () => {
  //   if (!failedAssetsIds.length) {
  //     return null;
  //   }

  //   setFailedAssetsRemovalLoading(true);

  //   for (const assetId of failedAssetsIds) {
  //     try {
  //       await deleteItem(assetId);
  //       setRemovedFailedAssetsLength((prevState) => prevState + 1);
  //     } catch (err) {
  //       console.log('ERROR', err)
  //     }
  //   }

  //   setFailedAssetsRemovalLoading(false);
  // };

  const readExcelFileAndSetState = async (excelFile: File) => {
    const assetsFromExcel = await readExcelFile(excelFile);
    const mappedData = getMappedDistributorPages(assetsFromExcel);
    setMappedExcelData(mappedData);
    // setExcelData(assetsFromExcel.filter((asset) => asset.edited));
  };

  const onDrop = useCallback((acceptedFiles: any) => {
    readExcelFileAndSetState(acceptedFiles[0]);
    setExcelFileName(acceptedFiles[0].name);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (!repositoryId || !repositoryName) {
    return <div>Wrong URL</div>;
  }

  return (
    <Flex gap={4} flexDir="column" padding={4}>
      <Card>
        <CardBody>
          <Heading size="sm" marginBottom={4}>
            Target repository: {repositoryName}
          </Heading>
          <Text>
            New distributor pages will be generated for selected repository. The
            table below shows just a couple of fields, but all fields will be
            generated.
          </Text>
        </CardBody>
      </Card>

      {!excelFileName && (
        <Flex
          {...getRootProps()}
          w="100%"
          height={150}
          justifyContent="center"
          alignItems="center"
          border="1px dashed #ccc"
          borderRadius={4}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </Flex>
      )}

      {excelFileName && (
        <Card width="100%">
          <CardBody padding="8px 16px">
            <Flex gap={4} alignItems="center">
              <Text size="sm">{excelFileName}</Text>
              <Button
                onClick={() => {
                  setExcelFileName(null);
                  setMappedExcelData(null);
                  setExcelFileName(null);
                  setFailedAssetsIds([]);
                  setErrors([]);
                }}
                size="sm"
                variant="outline"
                colorScheme="red"
                leftIcon={<CloseIcon />}
                isDisabled={false}
              >
                Remove
              </Button>
            </Flex>
          </CardBody>
        </Card>
      )}

      {excelFileName && (
        <Card width="100%">
          <CardBody padding="8px 16px">
            <Flex justifyContent="center" alignItems="center" gap={8}>
              <Flex alignItems="center" justifyContent="center" gap={2}>
                Channel:{" "}
                <Select
                  maxWidth={150}
                  value={selectedChannel?.id}
                  placeholder="Select channel"
                  onChange={(e) =>
                    setSelectedChannel({
                      id: e.target.value,
                      name: e.target.selectedOptions[0].text,
                    })
                  }
                >
                  {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </Select>
              </Flex>

              <Checkbox
                isChecked={publishAfterImport}
                onChange={(e) => setPublishAfterImport(e.target.checked)}
                isDisabled={isLoading}
              >
                Publish after import
              </Checkbox>
              <Button
                isDisabled={isLoading}
                onClick={startGenerating}
                isLoading={isLoading}
                loadingText={`${
                  Object.values(pagesStates).filter(
                    (state) => state === "PUBLISHED"
                  ).length
                } / ${mappedExcelData?.length} pages`}
              >
                {Object.keys(pagesStates).length > 0
                  ? "Start again"
                  : "Start generating"}
              </Button>
            </Flex>
          </CardBody>
        </Card>
      )}

      {failedAssetsIds.length > 0 && (
        <Card width="100%">
          <CardBody padding="8px 16px">
            <Alert status="warning" variant="subtle" background="none">
              <AlertIcon />
              <Flex flexDirection="column" gap={4} paddingLeft={8}>
                <Box>
                  Unfortunately, some assets could not be generated. You can
                  delete the <i>address</i> assets related to these pages.
                </Box>
                <Box>
                  Here are links to these assets in OCM. You can delete them
                  (there can be many links because of the URL length limit):
                  <Flex flexDirection="column" gap={2}>
                    {failedAssetsLinks.map((link, i) => (
                      <div key={link}>
                        <Link href={link} target="_blank" color="blue.500">
                          {i + 1}. Asset IDs
                        </Link>
                      </div>
                    ))}
                  </Flex>
                </Box>
              </Flex>
            </Alert>
          </CardBody>
        </Card>
      )}

      {mappedExcelData && !mappedExcelData.length && (
        <Alert status="warning" variant="subtle" background="none">
          <AlertIcon />
          No data found in the file. Is the file correct?
        </Alert>
      )}

      {mappedExcelData &&
        mappedExcelData.find(
          ({ assetName }) => assetName === EMPTY_DISTRIBUTOR_NAME_STRING
        ) && (
          <Alert status="warning" variant="subtle" background="none">
            <AlertIcon />
            Some Location Page assets have empty name
          </Alert>
        )}

      {errors.length > 0 && (
        <Table>
          <Thead>
            <Tr>
              <Th>Location page name</Th>
              <Th>Error</Th>
            </Tr>
          </Thead>
          <Tbody>
            {errors.map((error) => (
              <Tr key={`${error.assetName}${error.error}`}>
                <Td>{error.assetName}</Td>
                <Td>{error.error}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {mappedExcelData && mappedExcelData.length > 0 && (
        <Table>
          <Thead>
            <Tr>
              <Th width="15%">
                <Tooltip
                  label={
                    "This column shows the import progress. ✔️ means that asset was published, ❌ indicates an error and ☑️ means that asset was imported but not published yet."
                  }
                >
                  <div>
                    State <QuestionIcon />
                  </div>
                </Tooltip>
              </Th>
              <Th>Name</Th>
              <Th>Preview Fields</Th>
            </Tr>
          </Thead>

          <Tbody position="relative" width="100vw">
            {mappedExcelData.map((distributorPage, i) => (
              <Fragment key={distributorPage.assetName}>
                <Tr>
                  <Td width="10%">
                    {pagesStates[distributorPage.internalId] === "LOADING" && (
                      <Spinner size="sm" />
                    )}
                    {pagesStates[distributorPage.internalId] === "ERROR" && (
                      <Text>❌</Text>
                    )}
                    {pagesStates[distributorPage.internalId] ===
                      "PUBLISHED" && <Text>✔️</Text>}
                    {pagesStates[distributorPage.internalId] === "IMPORTED" && (
                      <Text>☑️</Text>
                    )}
                    {typeof pagesStates[distributorPage.internalId] ===
                      "undefined" && <Text color="gray">⚪</Text>}
                  </Td>

                  <Td position="relative" width="30%">
                    {distributorPage.assetName}
                  </Td>

                  <Td position="relative" width="60%">
                    <Flex flexDir="column" gap={2}>
                      <Box>
                        {Object.keys(distributorPage.fields)
                          .slice(0, 3)
                          .map((fieldKey) => {
                            return (
                              <Tag key={fieldKey} margin={1}>
                                {JSON.stringify(
                                  distributorPage.fields[
                                    fieldKey as keyof typeof distributorPage.fields
                                  ]
                                ).replaceAll('"', "")}
                              </Tag>
                            );
                          })}
                      </Box>
                    </Flex>
                  </Td>
                </Tr>
                {distributorPage.addresses?.length &&
                  distributorPage.addresses?.map((address, i) => (
                    <Tr key={address.assetName}>
                      <Td
                        position="relative"
                        width="30%"
                        colSpan={2}
                        textAlign="right"
                      >
                        ⬑ {address.assetName}
                      </Td>
                      <Td>
                        {Object.keys(address.fields)
                          .slice(0, 3)
                          .map((fieldKey) => {
                            return (
                              <Tag key={fieldKey} margin={1}>
                                {JSON.stringify(
                                  address.fields[
                                    fieldKey as keyof typeof address.fields
                                  ]
                                ).replaceAll('"', "")}
                              </Tag>
                            );
                          })}
                      </Td>
                    </Tr>
                  ))}
                <Tr padding={0}>
                  <Td colSpan={3} background="teal" padding={0} height="2px" />
                </Tr>
              </Fragment>
            ))}
          </Tbody>
        </Table>
      )}
    </Flex>
  );
};

export default GenerateDistributorPages;
