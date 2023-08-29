import {
    Button,
    Select,
    Text,
    VStack,
    Progress,
    Skeleton,
    Box,
    Flex,
    Checkbox
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { getAllTypes } from "../services/types.service";
import { fetchAllItemsOfTypeFromRepositoryIdScroll } from "../services/assets.service";
import { saveJSONToExcelFile } from "../services/files.service";
import { useSearchParams } from "react-router-dom";

const AssetDownloader: React.FC = () => {
    const [searchParams] = useSearchParams();
    const repositoryId = searchParams.get("id") || ""
    const repositoryName = searchParams.get("name") || ""
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<string>("");
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [isLoadingTypes, setIsLoadingTypes] = useState<boolean>(false);
    const [downloadTypes, setTypes] = useState<string[]>([]);
    const [onlyMaster, setOnlyMaster] = useState<boolean>(false); // State do przechowywania informacji o zaznaczeniu opcji

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingTypes(true)
            try {
                const types = await getAllTypes();
                setTypes(types.map(t => t.name));
            } catch (err) {
                console.log(err);
            }
            setIsLoadingTypes(false)
        };

        fetchData();
    }, []);

    async function fetchAsset(type: string | null) {
        if (!type) return
        setIsDownloading(true)
        const data = await fetchAllItemsOfTypeFromRepositoryIdScroll(
            repositoryId,
            [type],
            setDownloadProgress,
            {
                onlyMaster: onlyMaster
            }
        )
        await saveJSONToExcelFile(data, `${repositoryName}-${type}.xlsx`, "OCM", true)
        setIsDownloading(false)
    }

    return (
        <VStack spacing={5}>
            <Skeleton w={"100%"} isLoaded={!isLoadingTypes}>
                {isDownloading &&
                    <Box mb={4}>
                        <Flex direction={"column"} gap={1}>
                            <Text>{downloadProgress}</Text>
                            <Progress w={"100%"} isIndeterminate colorScheme={"blue"} />
                        </Flex>
                    </Box>
                }
                <Select
                    placeholder="Choose asset type to download"
                    onChange={(e) => setSelectedType(e.target.value)}
                >
                    {downloadTypes.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </Select>
                <Box pt={4}>
                    <Checkbox
                        isChecked={onlyMaster}
                        onChange={(e) => setOnlyMaster(e.target.checked)}
                    >
                        Download only Master Version
                    </Checkbox>
                </Box>
            </Skeleton>
            <Button w={"100%"} onClick={() => fetchAsset(selectedType)} isDisabled={!selectedType || isDownloading}>
                Download
            </Button>
        </VStack>
    );
};

export default AssetDownloader;
