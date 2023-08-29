import {useSearchParams} from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader, Checkbox,
    Flex,
    Heading, useToast,
} from "@chakra-ui/react";
import {useState} from "react";
import {DownloadIcon, SettingsIcon} from "@chakra-ui/icons";
import AssetDownloader from "../components/AssetDownloader";
import FileUpload from "../components/FileUpload";
import ExcelSettingsModal from "../components/ExcelSettingsModal";
import * as XLSX from "xlsx";
import {processExcelFiles, unflattenObject} from "../services/files.service";
import ConfirmationButton from "../components/ConfirmButton";
import {DropboxCLI} from "../components/Dropbox";
import {upload} from "@testing-library/user-event/dist/upload";
import {useAuth} from "../context/AuthContext";
import {updateItem} from "../services/assets.service";
import {publishItemById} from "../services/bulk.service";

const InfinityIQ = () => {
    const [file, setFile] = useState<File | null>(null)
    const [secondFile, setSecondFile] = useState<File | null>(null)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [downloadHeaders, setDownloadHeaders] = useState<string[]>([])
    const [importHeaders, setImportHeaders] = useState<string[]>([])
    const [matchedExcel, setMatchedExcel] = useState<ArrayBuffer | null>(null)
    const [unmatchedExcel, setUnmatchedExcel] = useState<ArrayBuffer | null>(null)
    const [matchedObjects, setMatchedObjects] = useState<any[]>([])
    const [unmatchedObjects, setUnmatchedObjects] = useState<any[]>([])
    const [matchedAndReversalExcel, setMatchedAndReversalExcel] = useState<File | null>(null)
    const [publishAssets, setPublishAssets] = useState<boolean>(false)
    const [publishingStatus, setPublishingStatus] = useState<string>("")
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const dropbox = new DropboxCLI(sessionStorage.getItem('API-KEY') || '')
    const toast = useToast();
    const {user} = useAuth();

    const onTopFileDropHandler = async (files: File[]) => {
        if (files.length === 0) return
        if (files[0] === null) return;
        setFile(files[0])
        setDownloadHeaders(await getHeaders(files[0]))
    }

    const onBottomFileDropHandler = async (files: File[]) => {
        if (files.length === 0) return
        if (files[0] === null) return;
        setSecondFile(files[0])
        setImportHeaders(await getHeaders(files[0]))
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

    async function handleMappingConfirmed(mapping: { import: string; download: string }[], keyField: string | null) {
        if (!keyField) return;
        if (mapping.length === 0) return;

        if (file && secondFile) {
            const result = await processExcelFiles(file, secondFile, keyField, mapping);
            setUnmatchedExcel(result.unmatchedExcel);
            setMatchedExcel(result.matchedExcel);
            setMatchedObjects(result.matchedObjects);
            setUnmatchedObjects(result.unmatchedObjects);
            setMatchedAndReversalExcel(result.matchedAndReversalExcel)
            debugger;
        } else {
            toast({
                title: "Error",
                description: "Both Excel files must be uploaded.",
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
    }

    const onUnmatchedExcelDownloadButtonClick = () => {
        if (unmatchedExcel) {
            saveBufferToExcelFile(unmatchedExcel, 'unmachted-assets.xlsx');
        }
    }

    const onMatchedExcelDownloadButtonClick = () => {
        if (matchedExcel) {
            saveBufferToExcelFile(matchedExcel, 'machted-assets.xlsx');
        }
    }

    function saveBufferToExcelFile(buffer: ArrayBuffer, filename: string) {
        if (buffer) {
            const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        }
    }

    async function onAssetsUpdate() {
        debugger
        if (matchedObjects.length === 0) {
            toast({
                title: "Error",
                description: "No assets to update.",
                status: "error",
                duration: 9000,
                isClosable: true,
            })
            return;
        }

        if (matchedExcel && unmatchedExcel && matchedAndReversalExcel) {
            setIsUpdating(true);
            const unflattenMatchedObjects = matchedObjects.map(obj => unflattenObject(obj));

            let counter = 0;
            let total = unflattenMatchedObjects.length;
            const fileName = `${user?.displayName}-${new Date().toISOString()}.xlsx`
            await uploadBackup(matchedAndReversalExcel, fileName);
            for (const asset of unflattenMatchedObjects) {
                try {
                    const {id, ...rest} = asset;
                    const result = await updateItem(id, rest, {
                        onlyFields: true,
                    });
                    if (publishAssets) {
                        await publishItemById(id);
                        setPublishingStatus(`Publishing ${counter} of ${total}`);
                        counter++;
                    }

                } catch (e) {
                    console.log("ERROR:", e);
                }

                toast({
                    title: "Success",
                    description: `Asset ${counter} of ${total} updated.`,
                    status: "success",
                    duration: 9000,
                    isClosable: true,
                })
            }
            setIsUpdating(false);
        }

        async function uploadBackup(file: File, name: string) {
            if (matchedAndReversalExcel) {
                await dropbox.uploadFile(file, name)
            }
        }
    }

    return <>
        <Box padding={5} maxW={800} margin="auto" borderRadius="md">
            <Flex gap={8} direction={"column"}>

                <Card borderRadius="md" overflow="hidden">
                    <CardHeader padding={4}>
                        <Heading size="md">Download assets from repository</Heading>
                    </CardHeader>
                    <CardBody padding={4}>
                        <AssetDownloader/>
                    </CardBody>
                </Card>

                <Card borderRadius="md" overflow="hidden">
                    <CardHeader padding={4}>
                        <Heading size="md">Upload assets to repository</Heading>
                    </CardHeader>
                    <CardBody padding={4}>
                        <FileUpload
                            onFileDropTop={onTopFileDropHandler}
                            onFileDropBottom={onBottomFileDropHandler}
                        >
                            <Flex direction={"column"} p={4} gap={4}>
                                <Button leftIcon={<SettingsIcon/>} isDisabled={file === null || secondFile === null}
                                        colorScheme="blue"
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

                                <Button isDisabled={!unmatchedExcel} onClick={onUnmatchedExcelDownloadButtonClick}
                                        leftIcon={<DownloadIcon/>}>
                                    Download Unmatched Assets
                                </Button>
                                <Button isDisabled={!matchedExcel} onClick={onMatchedExcelDownloadButtonClick}
                                        leftIcon={<DownloadIcon/>}>
                                    Download Matched Assets
                                </Button>
                                <ConfirmationButton isDisabled={!unmatchedExcel || !matchedExcel}
                                                    onConfirm={onAssetsUpdate} buttonText={
                                    isUpdating ? publishingStatus : "Update Assets"
                                } confirmationMessage={'testowa'}/>
                                <Checkbox checked={publishAssets} onChange={(e) => setPublishAssets(e.target.checked)}>Publish
                                    assets</Checkbox>
                            </Flex>

                        </FileUpload>
                    </CardBody>
                </Card>

                <Button>Dropbox</Button>
            </Flex>
        </Box>
    </>
}

export default InfinityIQ;
