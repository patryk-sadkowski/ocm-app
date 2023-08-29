import React, {ReactElement, useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Box, Text, Icon, VStack, Button} from '@chakra-ui/react';
import {AttachmentIcon, CheckCircleIcon, CloseIcon} from '@chakra-ui/icons';
import {motion} from 'framer-motion';

const MotionBox = motion(Box);

interface FileUploadProps {
    onFileDropTop?: (files: File[]) => void;
    onFileDropBottom?: (files: File[]) => void;
    children?: ReactElement | ReactElement[];
}

const FileUpload: React.FC<FileUploadProps> = ({
                                                   onFileDropTop,
                                                   onFileDropBottom,
                                                   children,
                                               }) => {
    const [uploadedFileTop, setUploadedFileTop] = useState<File | null>(null);
    const [uploadedFileBottom, setUploadedFileBottom] = useState<File | null>(null);
    const resetTop = () => setUploadedFileTop(null);
    const resetBottom = () => setUploadedFileBottom(null);

    const onDropTop = useCallback((acceptedFiles: File[]) => {
        setUploadedFileTop(acceptedFiles[0]);
        if (onFileDropTop) {
            onFileDropTop(acceptedFiles);
        }
    }, [onFileDropTop]);

    const onDropBottom = useCallback((acceptedFiles: File[]) => {
        setUploadedFileBottom(acceptedFiles[0]);
        if (onFileDropBottom) {
            onFileDropBottom(acceptedFiles);
        }
    }, [onFileDropBottom]);

    const renderContent = (isDragActive: boolean, uploadedFile: File | null, resetFunction: () => void, isModifier: boolean = false) => {
        if (uploadedFile) {
            return (
                <VStack spacing={2}>
                    <Icon as={CheckCircleIcon} boxSize={6} color="green.300"/>
                    <Text color="gray.400">{uploadedFile.name}</Text>
                    <Button size="sm" onClick={(e) => {
                        e.stopPropagation();
                        resetFunction();
                    }} leftIcon={<CloseIcon/>}>Usuń</Button>
                </VStack>
            );
        }
        return (
            <VStack spacing={2}>
                <Icon as={AttachmentIcon} boxSize={6} color="gray.300"/>
                <Text
                    color="gray.400">
                    {!isDragActive
                        ? (isModifier ? "Modifier File" : "File to be Updated")
                        : "Drag & drop a file here or click to select"
                    }
                </Text>
            </VStack>
        );
    }

    const {
        getRootProps: getRootPropsTop,
        getInputProps: getInputPropsTop,
        isDragActive: dragActiveTop,
    } = useDropzone({
        onDrop: onDropTop, maxFiles: 1, accept: {
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'text/csv': ['.csv'],
        }
    });

    const {
        getRootProps: getRootPropsBottom,
        getInputProps: getInputPropsBottom,
        isDragActive: dragActiveBottom,
    } = useDropzone({
        onDrop: onDropBottom, maxFiles: 1, accept: {
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'text/csv': ['.csv'],
        }
    });

    return (
        <Box display="flex">
            <Box flex="1" pr={2}>
                <MotionBox
                    {...getRootPropsTop()}
                    height="200px"
                    bg="gray.900"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mb={2}
                    textAlign="center"
                    transition={{duration: 0.3}}
                    cursor="pointer"
                    _hover={{bg: "gray.600"}}
                >
                    <input {...getInputPropsTop()} />
                    {renderContent(dragActiveTop, uploadedFileTop, resetTop)}
                </MotionBox>

                <MotionBox
                    {...getRootPropsBottom()}
                    height="200px"
                    bg="gray.900"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    transition={{duration: 0.3}}
                    cursor="pointer"
                    _hover={{bg: "gray.600"}}
                >
                    <input {...getInputPropsBottom()} />
                    {renderContent(dragActiveBottom, uploadedFileBottom, resetBottom, true)}
                </MotionBox>
            </Box>

            <Box flex="1" bg="gray.800" borderRadius="md">
                {children}
            </Box>
        </Box>
    );
};

export default FileUpload;
