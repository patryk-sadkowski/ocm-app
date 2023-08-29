import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Spinner
} from "@chakra-ui/react";
import React, { useState } from "react";

interface ConfirmationButtonProps {
    onConfirm: () => Promise<void> | void; // Consider onConfirm may return a Promise
    buttonText: string;
    confirmationMessage: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    isDisabled?: boolean;
}

const ConfirmationButton: React.FC<ConfirmationButtonProps> = ({
                                                                   onConfirm,
                                                                   buttonText,
                                                                   confirmationMessage,
                                                                   confirmButtonText = "Confirm",
                                                                   cancelButtonText = "Cancel",
                                                                   isDisabled = false
                                                               }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm(); // Await in case onConfirm returns a promise
        } catch (error) {
            console.error("Error during confirmation:", error);
        }
        setIsLoading(false);
        onClose();
    };

    return (
        <>
            <Button colorScheme={"red"} onClick={onOpen} isDisabled={isDisabled || isLoading}>
                {buttonText}
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirmation</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {confirmationMessage}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleConfirm} isLoading={isLoading}>
                            {isLoading ? <Spinner size="xs" marginRight={2} /> : null}
                            {confirmButtonText}
                        </Button>
                        <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
                            {cancelButtonText}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ConfirmationButton;
