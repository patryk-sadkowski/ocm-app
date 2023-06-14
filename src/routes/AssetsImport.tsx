import { CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Progress,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
} from "@chakra-ui/react";
import _ from "lodash";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import withAuth from "../hoc/withAuth";
import { updateItem } from "../services/assets.service";
import {
  publishItemById,
  setItemAsTransletedById,
} from "../services/bulk.service";
import { mapPagesDataForExcel } from "../services/excel.service";
import { readExcelFile } from "../services/files.service";

enum AssetState {
  NOT_UPDATED = "NOT_UPDATED",
  UPDATED = "UPDATED",
  PUBLISHED = "PUBLISHED",
}

interface ExcelItem {
  id: string;
  name: string;
  edited: boolean;
  language: string;
  fields_image_alt?: string;
  fields_meta_title?: string;
  fields_page_title?: string;
  fields_descriptions?: string;
  fields_slug?: string;
  state?: AssetState;
}

const AssetsImport = () => {
  const [excelFileName, setExcelFileName] = useState<null | string>(null);
  const [excelData, setExcelData] = useState<ExcelItem[]>();
  const [assetsUpdateLoading, setAssetsUpdateLoading] = useState(false);
  const toast = useToast();

  const updateAssets = async () => {
    setAssetsUpdateLoading(true);
    const EXCEL_FIELDS_PREFIX = "fields_";
    if (!excelData) {
      return;
    }
    const assetsWithPayload = excelData
      .filter((asset) => asset.edited)
      .map((asset) => {
        const fieldsKeys = Object.keys(asset).filter((key) =>
          key.includes(EXCEL_FIELDS_PREFIX)
        );

        const fieldsToOmit: ((keyof ReturnType<
          typeof mapPagesDataForExcel
        >[0] | string))[] = [
          "id",
          "name",
          "language",
          "repository",
          "type",
          "probableUrl",
          "edited",
          "teaser_media_id",
          "referenced_by_id",
          "referenced_by_language",
          "referenced_by_name",
        ];

        // Creating a sanitized copy of the object without some fields.
        const assetWithoutExcelCustomFields = _.omit(asset, [
          ...fieldsKeys,
          ...fieldsToOmit,
        ]);

        const fields = Object.fromEntries(
          fieldsKeys.map((key) => [
            key.replace(EXCEL_FIELDS_PREFIX, ""),
            (asset as any)[key],
          ])
        );

        const payload = {
          ...assetWithoutExcelCustomFields,
          fields,
        };

        console.log("PAYLOAD", { itemID: asset.id, payload });
        return { itemID: asset.id, payload };
      });

    for (const asset of assetsWithPayload) {
      try {
        const res = (await updateItem(asset.itemID, asset.payload)) as {
          id: string;
          language: string;
        };
        const assetsCopy = [...excelData];
        const assetIndex = assetsCopy.findIndex((asset) => asset.id === res.id);

        assetsCopy[assetIndex].state = AssetState.UPDATED;
        setExcelData(assetsCopy);

        res.language !== "en" && (await setItemAsTransletedById(asset.itemID));
        await publishItemById(asset.itemID);

        assetsCopy[assetIndex].state = AssetState.PUBLISHED;
        setExcelData(assetsCopy);
      } catch (err) {
        console.log("ERR", err);
        toast({
          title: "Error",
          description: `An error occured while updating assets. Asset: ${asset.itemID}`,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }
    setAssetsUpdateLoading(false);

    toast({
      title: "Assets updated",
      description: "Assets have been updated successfully",
      status: "success",
      duration: 9000,
      isClosable: true,
    });
  };

  const readExcelFileAndSetState = async (excelFile: File) => {
    const assetsFromExcel = (await readExcelFile(excelFile)) as ExcelItem[];
    setExcelData(assetsFromExcel.filter((asset) => asset.edited));
  };

  const onDrop = useCallback((acceptedFiles: any) => {
    readExcelFileAndSetState(acceptedFiles[0]);
    setExcelFileName(acceptedFiles[0].name);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const percentageProgress = excelData
    ? excelData?.reduce((acc, asset) => {
        if (asset.state === AssetState.PUBLISHED) {
          return acc + 1;
        }
        return acc;
      }, 0) / excelData?.length
    : 0;

  return (
    <Box padding={4}>
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
        <Flex
          justifyContent="space-between"
          alignItems="center"
          marginBottom={4}
        >
          <Flex gap={4} alignItems="center">
            <Text size="sm">{excelFileName}</Text>
            <Button
              onClick={() => {
                setExcelFileName(null);
                setExcelData([]);
              }}
              size="sm"
              variant="outline"
              colorScheme="red"
              leftIcon={<CloseIcon />}
              isDisabled={assetsUpdateLoading}
            >
              Remove
            </Button>
          </Flex>
          {excelData && excelData.length > 0 && (
            <Button isLoading={assetsUpdateLoading} onClick={updateAssets}>
              Proceed with {excelData.length} assets
            </Button>
          )}
        </Flex>
      )}

      {assetsUpdateLoading && excelData && (
        <Progress size="xs" value={percentageProgress * 100} />
      )}
      {excelData && excelData.length > 0 && (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>State</Th>
                <Th>ID</Th>
                <Th>Language</Th>
                <Th>Asset name</Th>
                {excelData?.find((item) => item.fields_image_alt) && (
                  <Th>Alt</Th>
                )}
                {excelData?.find((item) => item.fields_descriptions) && (
                  <Th>Description</Th>
                )}
                {excelData?.find((item) => item.fields_page_title) && (
                  <Th>Title</Th>
                )}
              </Tr>
            </Thead>
            <Tbody>
              {excelData.map((asset, i) => (
                <Tr key={i}>
                  <Td>
                    <Tooltip label={asset.state || "Not updated"}>
                      <Box>
                        {asset.state === AssetState.UPDATED && (
                          <Text color="orange">◍</Text>
                        )}
                        {(!asset.state ||
                          asset.state === AssetState.NOT_UPDATED) && (
                          <Text color="red">○</Text>
                        )}
                        {asset.state === AssetState.PUBLISHED && (
                          <Text color="green">●</Text>
                        )}
                      </Box>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Tooltip label={asset.id}>
                      <Box>{asset.id}</Box>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Tooltip label={asset.language}>
                      <Box>{asset.language}</Box>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Tooltip label={asset.name}>
                      <Box>{asset.name.substring(0, 10)}...</Box>
                    </Tooltip>
                  </Td>

                  {asset.fields_image_alt && (
                    <Td>
                      <Tooltip label={asset.fields_image_alt}>
                        <Box>{asset.fields_image_alt.substring(0, 10)}...</Box>
                      </Tooltip>
                    </Td>
                  )}
                  {asset.fields_descriptions && (
                    <Td>
                      <Tooltip label={asset.fields_descriptions}>
                        <Box>
                          {asset.fields_descriptions.substring(0, 10)}...
                        </Box>
                      </Tooltip>
                    </Td>
                  )}
                  {asset.fields_page_title && (
                    <Td>
                      <Tooltip label={asset.fields_page_title}>
                        <Box>{asset.fields_page_title.substring(0, 10)}...</Box>
                      </Tooltip>
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default withAuth(AssetsImport);
