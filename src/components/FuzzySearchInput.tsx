import React, { useState, useEffect } from 'react';
import { Input, List, ListItem, useColorMode } from "@chakra-ui/react";
import Fuse from "fuse.js";

type FuzzySearchInputProps = {
    options: string[];
    onSelect: (value: string) => void;
    placeholder?: string;
    value?: string | null;
};

const FuzzySearchInput: React.FC<FuzzySearchInputProps> = ({ options, onSelect, placeholder, value }) => {
    const [inputValue, setInputValue] = useState(value || "");
    const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
    const [isListVisible, setListVisible] = useState(false);
    const { colorMode } = useColorMode();

    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    useEffect(() => {
        const fuse = new Fuse(options, { threshold: 0.4 });
        if (inputValue) {
            setFilteredOptions(fuse.search(inputValue).map(result => result.item));
        } else {
            setFilteredOptions(options);
        }
    }, [inputValue, options]);

    const handleItemClick = (item: string) => {
        onSelect(item);
        setInputValue(item);
        setListVisible(false);
    };

    return (
        <div style={{ width: "100%"}}>
            <Input
                placeholder={placeholder}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onFocus={() => setListVisible(true)}
                onBlur={() => setTimeout(() => setListVisible(false), 200)}
            />
            {(isListVisible && filteredOptions.length > 0) && (
                <List
                    border="1px solid"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    borderRadius="md"
                    mt={2}
                    position="absolute"
                    zIndex={1}
                    width="100%"
                    maxHeight="300px"
                    overflowY="auto"
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                >
                    {filteredOptions.map((item, index) => (
                        <ListItem key={index} py={2} px={3} cursor="pointer" onClick={() => handleItemClick(item)}>
                            {item}
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
};

export default FuzzySearchInput;
