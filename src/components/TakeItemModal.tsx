import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Text, ModalFooter, ButtonGroup, Button, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, VStack } from "@chakra-ui/react";
import { NextComponentType } from "next";
import { useState } from "react";

export interface TakeItemModalProps {
    open: boolean,
    onClose: () => void,
    onSubmit: (itemCount: number) => void,
    itemMaxCount: number
}

const TakeItemModal: NextComponentType<{}, {}, TakeItemModalProps> = (props) => {
    const { open, onClose, onSubmit, itemMaxCount } = props;

    const [itemCount, setItemCount] = useState(1);

    return (
        <Modal size="xl" isOpen={open} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Posten entnehmen</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack>
                        <Text>Wie viel soll entnommen werden?</Text>

                        <NumberInput maxWidth="24" size='lg'
                            min={1}
                            max={itemMaxCount}
                            defaultValue={itemCount}
                            onChange={(_, valueAsNumber) => setItemCount(valueAsNumber)}
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>

                        <Text>Nach der Entnahme verbleiben noch {itemMaxCount - itemCount} Einheiten in diesem Posten.</Text>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup colorScheme="blue">
                        <Button variant="ghost" onClick={onClose}>Doch nicht</Button>
                        <Button onClick={() => onSubmit(itemCount)}>
                            {itemCount} entnehmen
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TakeItemModal;
