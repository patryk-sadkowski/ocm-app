import React, {useState, useRef, useEffect, ReactNode} from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    Input,
    FormControl,
    FormLabel,
    Alert,
    AlertIcon,
    AlertDescription, Center, Box, Text
} from "@chakra-ui/react";
import {DropboxCLI} from "./Dropbox";

interface PasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onPasswordSubmit: (password: string) => void;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({ isOpen, onClose, onPasswordSubmit }) => {
    const [password, setPassword] = useState("");
    const [isInvalid, setIsInvalid] = useState(false);

    const handleSubmit = () => {
        if (password) {
            onPasswordSubmit(password);
        } else {
            setIsInvalid(true);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Enter Password</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </FormControl>
                    {isInvalid && (
                        <Alert status="error" mt={4}>
                            <AlertIcon />
                            <AlertDescription>Wrong Password.</AlertDescription>
                        </Alert>
                    )}
                    <Button mt={4} colorScheme="teal" onClick={handleSubmit}>
                        Login
                    </Button>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

interface PasswordProtectionProps {
    children: ReactNode;
    password: string;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ children, password }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [hasAttemptedAuthentication, setHasAttemptedAuthentication] = useState(false);
    const promptShownRef = useRef(false);

    useEffect(() => {
        const checkAuthentication = () => {
            const authSession = sessionStorage.getItem('isAuthenticated');
            if (authSession === "true") {
                setIsAuthenticated(true);
                return true;
            }
            return false;
        }

        if (!checkAuthentication() && !promptShownRef.current) {
            setIsDialogOpen(true);
            promptShownRef.current = true;
        }
    }, [password]);

    const handlePasswordSubmit = async (enteredPassword: string) => {
        if (enteredPassword) {
            debugger
            try {
                debugger
                const dropbox = new DropboxCLI(enteredPassword)
                await dropbox.connectionTest();
                setIsAuthenticated(true);
                setIsDialogOpen(false);
                sessionStorage.setItem('isAuthenticated', "true");
                sessionStorage.setItem('API-KEY', enteredPassword);
            } catch (e) {
                console.log("ERROR", e)
            }

        } else {
            setIsDialogOpen(false);
            setHasAttemptedAuthentication(true);
        }
    };

    return (
        <>
            {isAuthenticated ? (
                children
            ) : (
                <>
                    {isDialogOpen && (
                        <PasswordDialog
                            isOpen={isDialogOpen}
                            onClose={() => {
                                setIsDialogOpen(false);
                                setHasAttemptedAuthentication(true);
                            }}
                            onPasswordSubmit={handlePasswordSubmit}
                        />
                    )}
                    {hasAttemptedAuthentication && (
                        <Center height="80vh">
                            <Box
                                padding="20px"
                                boxShadow="lg"
                                borderRadius="md"
                                bg="red.500"
                                color="white"
                            >
                                <Text fontSize="xl">No Access</Text>
                            </Box>
                        </Center>
                    )}
                </>
            )}
        </>
    );
};

export default PasswordProtection;
