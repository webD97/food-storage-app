import { CheckIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { Table, Tbody, Tr, Th, Td, HStack, Badge, TableProps, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, IconButton, ButtonGroup, Tooltip, Tfoot, TableContainer } from "@chakra-ui/react";
import { NextComponentType } from "next";
import Link from "next/link";
import { useState } from "react";
import { Article } from "../model/Article";

export interface ArticleInfoTableProps {
    article: Article,
    editMode?: boolean,
    onSaveButtonClicked?: (updatedArticle: Article) => void,
    onCancelButtonClicked?: () => void
};

const ArticleInfoTable: NextComponentType<{}, {}, ArticleInfoTableProps & TableProps> = (props) => {
    const {
        article,
        editMode = false,
        onSaveButtonClicked = () => undefined,
        onCancelButtonClicked = () => undefined
    } = props;

    const { gtin, name, keywords, targetAmount } = article;

    const [editState, setEditState] = useState(article);

    return (
        <TableContainer>
            <Table {...props}>
                <Tbody>
                    <Tr>
                        <Th>GTIN</Th>
                        <Td padding="16px">{gtin}</Td>
                    </Tr>
                    <Tr>
                        <Th>Bezeichnung</Th>
                        <Td padding={editMode ? '10px' : '16px'}>
                            {
                                editMode === false
                                    ? name
                                    : <Input marginLeft="-12px" size="sm" value={editState.name} onChange={(event) => setEditState(previous => ({ ...previous, name: event.target.value }))} />
                            }
                        </Td>
                    </Tr>
                    <Tr>
                        <Th>Schlagworte</Th>
                        <Td padding={editMode ? '10px' : '16px'}>
                            <HStack justifyContent="flex-start">
                                {
                                    editMode === false
                                        ? (
                                            keywords.map((keyword) => (
                                                <Link passHref key={keyword} href={`/keyword/${encodeURIComponent(keyword.toLocaleLowerCase())}`}>
                                                    <a><Badge>{keyword}</Badge></a>
                                                </Link>
                                            ))
                                        )
                                        : (
                                            <Input marginLeft="-12px" size="sm"
                                                value={editState.keywords.join(', ')}
                                                onChange={(event) => {
                                                    setEditState(previous => ({
                                                        ...previous,
                                                        keywords: event.target.value.split(',').map(value => value.trim()).filter(value => value !== '')
                                                    }));
                                                }}
                                                onKeyUp={(event) => {
                                                    if (event.key !== ',') return;

                                                    setEditState(previous => ({
                                                        ...previous,
                                                        keywords: [...previous.keywords, ' ']
                                                    }));
                                                }}
                                            />
                                        )
                                }
                            </HStack>
                        </Td>
                    </Tr>
                    <Tr>
                        <Th>Mindestbestand</Th>
                        <Td padding={editMode ? '10px' : '16px'}>
                            {
                                editMode === false
                                    ? targetAmount
                                    : (
                                        <NumberInput size="sm" marginLeft="-12px" marginRight="12px" min={0}
                                            value={editState.targetAmount}
                                            onChange={(_, valueAsNumber) => setEditState(previous => ({ ...previous, targetAmount: valueAsNumber }))}
                                        >
                                            <NumberInputField />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    )
                            }
                        </Td>
                    </Tr>
                </Tbody>
                <Tfoot>
                    <Tr>
                        <Th isNumeric colSpan={2} paddingRight={6}>
                            {
                                editMode === false
                                    ? null
                                    : (
                                        <ButtonGroup>
                                            <Tooltip label="Änderungen speichern">
                                                <IconButton aria-label="Bearbeiten" size="sm" icon={<CheckIcon />} onClick={() => onSaveButtonClicked(editState)} />
                                            </Tooltip>
                                            <Tooltip label="Änderungen verwerfen">
                                                <IconButton aria-label="Bearbeiten" size="sm" icon={<SmallCloseIcon />} onClick={onCancelButtonClicked} />
                                            </Tooltip>
                                        </ButtonGroup>
                                    )
                            }
                        </Th>
                    </Tr>
                </Tfoot>
            </Table>
        </TableContainer>
    );
}

export default ArticleInfoTable