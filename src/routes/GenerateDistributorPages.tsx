import { CloseIcon, QuestionIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Code,
  Flex,
  Heading,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import { Fragment, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useSearchParams } from "react-router-dom";
import { getMappedDistributorPages } from "../services/distributorPages.service";
import { readExcelFile } from "../services/files.service";

const GenerateDistributorPages = () => {
  const [searchParams] = useSearchParams();
  const repositoryId = searchParams.get("id");
  const repositoryName = searchParams.get("name");
  const [excelFileName, setExcelFileName] = useState<null | string>(null);
  const [mappedExcelData, setMappedExcelData] = useState<null | ReturnType<
    typeof getMappedDistributorPages
  >>(null);

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
            New distributor pages will be generated for this repository. The
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
                  // setExcelData([]);
                  // setPreviewPage(0);
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

      {excelFileName && <Button>Start generating</Button>}

      {mappedExcelData && !mappedExcelData.length && (
        <Alert status="warning" variant="subtle" background="none">
          <AlertIcon />
          No data found in the file. Is the file correct?
        </Alert>
      )}

      {mappedExcelData && mappedExcelData.length > 0 && (
        <Table>
          <Thead>
            <Tr>
              <Th width="15%">
                <Tooltip
                  label={
                    "This column shows update progress. Green means that asset was updated correctly. Red indicates an error."
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
                  <Td width="10%">x</Td>

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
                    <Tr>
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
