import React, { useRef } from "react";
import {Button, Box, useToast, Text} from "@chakra-ui/react";
import {ArrowUpIcon} from "@chakra-ui/icons";

interface ExcelUploaderProps {
    onFileUploaded: (file: File) => void;
    label: string;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onFileUploaded, label }) => {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUploaded(file);
            toast({
                title: "File uploaded",
                description: `You've uploaded ${file.name}`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleButtonClick = () => {
        inputFileRef.current?.click();
    };

    return (
        <Box>
            <input
                type="file"
                accept=".xlsx, .xls"
                style={{ display: "none" }}
                ref={inputFileRef}
                onChange={handleFileChange}
            />
            <Button w={"100%"} leftIcon={<ArrowUpIcon />} onClick={handleButtonClick}>
               {label}
            </Button>
        </Box>
    );
};

export default ExcelUploader;
