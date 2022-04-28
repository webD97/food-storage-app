import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, ButtonGroup, Button, VStack } from "@chakra-ui/react";
import { NextComponentType } from "next";

export interface FileSelectModalProps {
    open: boolean,
    onClose: () => void,
    onSubmit: () => void,
    title: string
}

const FileSelectModal: NextComponentType<{}, {}, FileSelectModalProps> = (props) => {
    const { open, onClose, onSubmit, title } = props;

    return (
        <Modal size="xl" isOpen={open} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack>
                        Select a file
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup colorScheme="blue">
                        <Button variant="ghost" onClick={onClose}>Doch nicht</Button>
                        <Button onClick={() => onSubmit()}>
                            Spcihern
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default FileSelectModal;
