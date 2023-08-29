import {useSearchParams} from "react-router-dom";
import {
    Box, Button, Divider, Flex, Heading, useToast, Wrap, Text, AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Select,
    Progress, Card, CardBody,

} from "@chakra-ui/react";
import {DownloadIcon} from "@chakra-ui/icons";
import {FunctionComponent, useRef, useState} from "react";
import {fetchAllItemsOfTypeFromRepositoryIdScroll} from "../services/assets.service";
import {IRFile} from "../types/repositories";
import {processExcelFiles, readExcelFile, saveJSONToExcelFile, unflattenObject} from "../services/files.service";
import ExcelUploader from "./ExcelUploader";
import ExcelSettingsModal from "./ExcelSettingsModal";
import * as XLSX from 'xlsx';
import {DropboxCLI} from "./Dropbox";
import FileUpload from "./FileUpload";
import {useAuth} from "../context/AuthContext";


interface Props {
    type: string,
    availableAssetTypes: string[],
}

const AssetBox: FunctionComponent<Props> = ({
                                                type, availableAssetTypes,
                                            }) => {
    const [data, setData] = useState<IRFile[]>([])
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [loadingProgress, setLoadingProgress] = useState<string>("");
    const toast = useToast();
    const [searchParams] = useSearchParams();
    const repositoryId = searchParams.get("id") || ""
    const repositoryName = searchParams.get("name") || ""

    const [secondFile, setSecondFile] = useState<File | null>(null);  // Drugi plik Excel
    const [unmatchedExcel, setUnmatchedExcel] = useState<Buffer | null>(null);
    const [matchedExcel, setMatchedExcel] = useState<Buffer | null>(null);
    const [matchedObjects, setMatchedObjects] = useState<any[] | null>(null);

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const onClose = () => setIsOpen(false);
    const cancelRef = useRef(null);
    const [selectedAssetType, setSelectedAssetType] = useState<string>("");
    const dropbox = new DropboxCLI("sl.Bk1iEND_ENnmYuDQtuc1zUv5bqOeVCiL0nKM_tnfOa_N-NpgfCp9XvbikQloqsH5VYHQ7OB1xnfzWpakCtl5BlSjuH_tWsS3MABjIEE-aWXHajc-T4W-0VmYWVPDaJJUhBe8bwEBkDwvLLw")


    const [downloadHeaders, setDownloadHeaders] = useState<string[]>([])
    const [importHeaders, setImportHeaders] = useState<string[]>([])
    const { user } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    const handleAssetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAssetType(event.target.value);
    };

    const handleMappingConfirmed = async (mapping: { import: string; download: string }[], keyField: string | null) => {
        if (!keyField) return;
        if (file && secondFile) {
            const result = await processExcelFiles(file, secondFile, keyField, mapping);
            setUnmatchedExcel(result.unmatchedExcel);
            setMatchedExcel(result.matchedExcel);
            setMatchedObjects(result.matchedObjects);
        } else {
            toast({
                title: "Error",
                description: "Both Excel files must be uploaded.",
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
    };

    function saveBufferToExcelFile(buffer: Uint8Array, filename: string) {
        const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    function getHeaders(file: File): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function (e: ProgressEvent<FileReader>) {
                if (e.target && e.target.result) {
                    const data = e.target.result as string;

                    // Read the workbook
                    const workbook = XLSX.read(data, {type: 'binary'});

                    // Get the first sheet name
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // Convert the sheet to JSON
                    const json: any[][] = XLSX.utils.sheet_to_json(worksheet, {header: 1});

                    // Assuming the first row of the sheet is the header
                    const headers = json[0] as string[];

                    resolve(headers);
                } else {
                    reject(new Error("Failed to read the file."));
                }
            };

            reader.onerror = function (e) {
                reject(new Error("Error reading the file."));
            };

            reader.readAsBinaryString(file);
        });
    }

    const fetchAssets = async () => {
        setIsLoading(true)
        try {
            const data = await fetchAllItemsOfTypeFromRepositoryIdScroll(
                repositoryId,
                [selectedAssetType],
                setLoadingProgress
            )
            console.log(data)
            setData(data)

            await saveJSONToExcelFile(data, `${repositoryName}-${selectedAssetType}.xlsx`, "OCM", true);


        } catch (e) {
            toast({
                title: "Error",
                description: "Could not fetch pages",
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
        setIsLoading(false)
    }


    const importExcel = async (file: File[] | File) => {
        const computedFile = Array.isArray(file) ? file[0] : file;
        const data = await readExcelFile(computedFile) as any[]
        setFile(computedFile)
        setDownloadHeaders(await getHeaders(computedFile))
    }

    const importExcel2 = async (file: File[] | File) => {
        const computedFile = Array.isArray(file) ? file[0] : file;
        const data = await readExcelFile(computedFile) as any[]
        setSecondFile(computedFile)
        setImportHeaders(await getHeaders(computedFile))
    }

    const confirmChanges = () => {
        // Logika zatwierdzania zmian
        console.log("Zmiany zostały zatwierdzone");
        onClose();
    };

    return (
        <Box padding={5} border="1px" borderColor="gray.200" borderRadius="md">
            <Flex direction="column" gap={4}>
                <Select
                    value={selectedAssetType}
                    onChange={handleAssetChange}
                    isDisabled={isLoading}
                >
                    {availableAssetTypes.map(asset => (
                        <option key={asset} value={asset}>{asset}</option>
                    ))}
                </Select>

                {isLoading && (
                    <Flex direction="column" gap={4} mt={3}>
                        <Text color="blue.500">Downloading...</Text>
                        <Progress size="xs" isIndeterminate mt={2}/>
                        <Text mt={2}>{loadingProgress}</Text>
                    </Flex>
                )}

                <Button
                    isDisabled={isLoading || selectedAssetType === ""}
                    onClick={fetchAssets}
                    leftIcon={<DownloadIcon/>}
                >
                    Download {selectedAssetType}
                </Button>

                <Flex direction={"column"} gap={4}>
                    <ExcelUploader onFileUploaded={importExcel} label={file ? file.name : "Upload First File"}/>
                    <ExcelUploader onFileUploaded={importExcel2}
                                   label={secondFile ? secondFile.name : "Upload Second File"}/>
                </Flex>


                <FileUpload
                    onFileDropTop={importExcel}
                    onFileDropBottom={importExcel2}
                >
                    <Button isDisabled={file === null || secondFile === null} colorScheme="blue"
                            onClick={() => setIsModalOpen(true)}>
                        Map Excel Files
                    </Button>
                    <ExcelSettingsModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        downloadHeaders={downloadHeaders}
                        importHeaders={importHeaders}
                        onMappingConfirmed={handleMappingConfirmed}
                    />
                    <>
                        <Button isDisabled={matchedExcel === null || unmatchedExcel === null} colorScheme="red"
                                onClick={() => setIsOpen(true)}>
                            Confirm Changes
                        </Button>

                        {matchedExcel &&
                            <Button colorScheme="green"
                                    onClick={() => saveBufferToExcelFile(matchedExcel, "matched.xlsx")}>
                                Save Matched Excel
                            </Button>}

                        {unmatchedExcel && <Button colorScheme="green"
                                                   onClick={() => saveBufferToExcelFile(unmatchedExcel, "unmatched.xlsx")}>
                            Save Unmatched Excel
                        </Button>}

                        <Button isDisabled={secondFile === null} onClick={async () => {
                            if (secondFile) {
                                await dropbox.uploadFile(secondFile, `${new Date()}-${user}-${secondFile.name}`)
                            }
                        }}>
                            Dropbox
                        </Button>
                    </>
                </FileUpload>


                <Flex direction="row" gap={4} alignItems="center" mt={4}>

                    <Button isDisabled={file === null || secondFile === null} colorScheme="blue"
                            onClick={() => setIsModalOpen(true)}>
                        Map Excel Files
                    </Button>
                    <ExcelSettingsModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        downloadHeaders={downloadHeaders}
                        importHeaders={importHeaders}
                        onMappingConfirmed={handleMappingConfirmed}
                    />
                    <Button isDisabled={matchedExcel === null || unmatchedExcel === null} colorScheme="red"
                            onClick={() => setIsOpen(true)}>
                        Confirm Changes
                    </Button>

                    {matchedExcel &&
                        <Button colorScheme="green" onClick={() => saveBufferToExcelFile(matchedExcel, "matched.xlsx")}>
                            Save Matched Excel
                        </Button>}

                    {unmatchedExcel && <Button colorScheme="green"
                                               onClick={() => saveBufferToExcelFile(unmatchedExcel, "unmatched.xlsx")}>
                        Save Unmatched Excel
                    </Button>}

                    <Button isDisabled={secondFile === null} onClick={async () => {
                        if (secondFile) {
                            await dropbox.uploadFile(secondFile, `${new Date().getTime()}-${user?.displayName}-${secondFile.name}`)
                        }
                    }}>
                        Dropbox
                    </Button>


                    <AlertDialog
                        isOpen={isOpen}
                        leastDestructiveRef={cancelRef}
                        onClose={onClose}
                    >
                        <AlertDialogOverlay>
                            <AlertDialogContent>
                                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                    Warning
                                </AlertDialogHeader>
                                <AlertDialogBody>
                                    Are you sure you want to confirm these changes? Ensure you have used the mapper
                                    correctly. Incorrect usage may lead to errors.
                                </AlertDialogBody>
                                <AlertDialogFooter>
                                    <Button ref={cancelRef} onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button colorScheme="red" onClick={confirmChanges} ml={3}>
                                        Confirm
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialogOverlay>
                    </AlertDialog>
                </Flex>
            </Flex>
        </Box>
    );
};


export default AssetBox;
