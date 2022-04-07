import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Text, ModalFooter, ButtonGroup, Button, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, VStack } from "@chakra-ui/react";
import { NextComponentType } from "next";
import { useState } from "react";
import { SingleDatepicker } from "chakra-dayzed-datepicker";

export interface StoreItemModalProps {
    open: boolean,
    onClose: () => void,
    onSubmit: (bestBefore: Date, itemCount: number) => void
}

const StoreItemModal: NextComponentType<{}, {}, StoreItemModalProps> = (props) => {
    const { open, onClose, onSubmit } = props;

    const [itemCount, setItemCount] = useState(1);
    const [bestBefore, setBestBefore] = useState(new Date());

    return (
        <Modal size="xl" isOpen={open} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Posten einlagern</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack>
                        <Text>Wie lange ist der Artikel haltbar?</Text>
                        <SingleDatepicker
                            date={bestBefore}
                            onDateChange={setBestBefore}
                        />

                        <Text>Wie viele Einheiten sollen eingelagert werden?</Text>
                        <NumberInput maxWidth="24" size='lg'
                            min={1}
                            max={100}
                            defaultValue={itemCount}
                            onChange={(_, valueAsNumber) => setItemCount(valueAsNumber)}
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup colorScheme="blue">
                        <Button variant="ghost" onClick={onClose}>Doch nicht</Button>
                        <Button onClick={() => onSubmit(bestBefore, itemCount)}>
                            {itemCount} einlagern
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default StoreItemModal;
