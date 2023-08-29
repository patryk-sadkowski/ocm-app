import React, { useState, useEffect } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalFooter, ModalBody, Button, Tooltip, VStack,
    Box, Heading, Table, Tbody, Tr, Td,
    Toast, useToast
} from "@chakra-ui/react";
import { InfoIcon } from '@chakra-ui/icons';
import FuzzySearchInput from './FuzzySearchInput';

type ExcelSettingsModalProps = {
    importHeaders: string[];
    downloadHeaders: string[];
    isOpen: boolean;
    onClose: () => void;
    onMappingConfirmed: (mapping: { import: string; download: string }[], keyField: string|null) => void;
};

const ExcelSettingsModal: React.FC<ExcelSettingsModalProps> = ({ importHeaders, downloadHeaders, isOpen, onClose, onMappingConfirmed }) => {
    const [selectedKeyField, setSelectedKeyField] = useState<string | null>(null);
    const [columnMapping, setColumnMapping] = useState<{ import: string, download: string }[]>([]);
    const [selectedImportColumn, setSelectedImportColumn] = useState<string | null>(null);
    const [selectedDownloadColumn, setSelectedDownloadColumn] = useState<string | null>(null);

    const toast = useToast();

    const addMapping = () => {
        if (!selectedImportColumn || !selectedDownloadColumn) {
            toast({
                title: "Incomplete selection.",
                description: "Please select both an import and download column.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setColumnMapping(prev => [...prev, { import: selectedImportColumn, download: selectedDownloadColumn }]);
        setSelectedImportColumn(null);
        setSelectedDownloadColumn(null);
    };


    const confirmMapping = () => {
        onMappingConfirmed(columnMapping, selectedKeyField);
        toast({
            title: "Mapping confirmed.",
            description: "Your columns have been successfully mapped.",
            status: "success",
            duration: 5000,
            isClosable: true,
        });
        onClose();
    };

    const availableImportHeaders = importHeaders.filter(header => header !== selectedKeyField && !columnMapping.some(map => map.import === header));
    const availableDownloadHeaders = downloadHeaders.filter(header => !columnMapping.some(map => map.download === header));

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Excel Mapping</ModalHeader>
                <ModalBody>
                    <Box mb={4}>
                        <Heading size="md" mb={2}>Select Key Field</Heading>
                        <FuzzySearchInput
                            options={importHeaders}
                            onSelect={value => setSelectedKeyField(value)}
                        />
                    </Box>

                    {selectedKeyField && (
                        <Box mb={4}>
                            <Heading size="md" mb={2}>
                                Map Columns
                                <Tooltip hasArrow label="Map the columns from your imported Excel to the columns in your desired output.">
                                    <InfoIcon boxSize="0.8em" ml={2} />
                                </Tooltip>
                            </Heading>

                            <VStack spacing={3}>
                                <FuzzySearchInput
                                    options={availableImportHeaders}
                                    onSelect={value => setSelectedImportColumn(value)}
                                    placeholder="Search Import Columns"
                                    value={selectedImportColumn}
                                />
                                <FuzzySearchInput
                                    options={availableDownloadHeaders}
                                    onSelect={value => setSelectedDownloadColumn(value)}
                                    placeholder="Search Download Columns"
                                    value={selectedDownloadColumn}
                                />
                                <Button onClick={addMapping} w="100%">Add Selected Columns</Button>
                            </VStack>

                            <Table variant="simple">
                                <Tbody>
                                    {columnMapping.map((mapping, index) => (
                                        <Tr key={index}>
                                            <Td>{mapping.import}</Td>
                                            <Td>{mapping.download}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" onClick={confirmMapping} w="100%">Confirm Mapping</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default ExcelSettingsModal;
