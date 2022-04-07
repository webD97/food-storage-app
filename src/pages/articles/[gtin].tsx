import { Heading, SkeletonText, Table, Tbody, Td, Thead, Tr, Text, Container, VStack, Th, IconButton, HStack, Tooltip, Editable, EditableInput, EditablePreview, useToast, Progress, Box, Image, Badge } from '@chakra-ui/react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useCollection, useResource } from 'react-ketting';
import type { Article } from '../../model/Article';
import type { StorageItem } from '../../model/StorageItem';
import { Resource } from 'ketting';
import { DateTime } from 'luxon';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { AddAPhoto } from '@mui/icons-material';
import TakeItemModal from '../../components/TakeItemModal';
import { useCallback, useEffect, useState } from 'react';
import StoreItemModal from '../../components/StoreItemModal';
import StorageItemService from '../../service/StorageItemService';
import ToastService from '../../service/ToastService';

interface ArticlePageProps {
    gtin: string | string[] | undefined
}

const ArticlePage: NextPage<ArticlePageProps> = ({ gtin }) => {
    const toast = useToast();

    const [totalStorageItems, setTotalStorageItems] = useState(0);
    const [currentEditStorageItem, setCurrentEditStorageItem] = useState<Resource<StorageItem> | undefined>();
    const [storeItemModalOpen, setStoreItemModalOpen] = useState(false);

    const {
        resource: articleResource,
        data: articleState,
        loading: articleLoading,
        error: articleError,
        setData: setArticleData,
        submit: submitArticle
    } = useResource<Article>(`articles/${gtin}`);

    const {
        items: storageItems,
        loading: storageItemsLoading,
        resource: storageItemsResource
    } = useCollection<StorageItem>(articleResource.follow('storageItems'), { refreshOnStale: true });

    const onSubmitTakeItemModal = useCallback(async (itemCount: number) => {
        if (currentEditStorageItem === undefined) return;

        try {
            await StorageItemService.removeItemFromStorage(currentEditStorageItem, itemCount);
            setCurrentEditStorageItem(undefined);
            ToastService.takeItemSuccess(toast);
        }
        catch (e) {
            console.error(e);
            ToastService.takeItemFailed(toast);
        }
    }, [currentEditStorageItem, toast]);

    const onCloseTakeItemModal = useCallback(() => setCurrentEditStorageItem(undefined), []);

    useEffect(() => {
        Promise.all(storageItems.map(item => item.get()))
            .then(storageItems => {
                const total = storageItems.map(item => item.data)
                    .reduce((prev, next) => prev + next.amount, 0);

                setTotalStorageItems(total);
            });
    }, [storageItems]);

    if (articleError) return <Text>Der Artikel konnte nicht geladen werden: {JSON.stringify(articleError)}</Text>;

    return (
        <>
            <TakeItemModal
                open={currentEditStorageItem !== undefined}
                onClose={onCloseTakeItemModal}
                onSubmit={onSubmitTakeItemModal}
                itemMaxCount={currentEditStorageItem?.getCache()?.data.amount || 0}
            />

            <StoreItemModal
                open={storeItemModalOpen}
                onClose={() => setStoreItemModalOpen(false)}
                onSubmit={async (bestbefore, itemCount) => {
                    await StorageItemService.storeItem(storageItemsResource, itemCount, bestbefore, articleResource.uri);

                    setStoreItemModalOpen(false);
                }}
            />

            <VStack>
                <Container maxWidth="container.xl" marginBottom="12">
                    {
                        articleLoading
                            ? <Text>Artikel wird geladen</Text>
                            : (
                                <HStack alignItems="flex-start" gap="12">
                                    <Box width="md" height="xs" borderWidth="1px" borderRadius="lg" flexGrow={0} padding=".5em">
                                        <Image fallback={<AddAPhoto />} src="/4388840219872.webp" alt="Artikelbild" objectFit="contain" height="100%" width="100%" />
                                    </Box>
                                    <Box flexGrow={1}>
                                        <HStack marginBottom="4">
                                            <Heading as="h2" size="lg">{articleState?.name}</Heading>
                                        </HStack>
                                        <Table size="sm">
                                            <Tbody>
                                                <Tr>
                                                    <Th>GTIN</Th>
                                                    <Td>{articleState.gtin}</Td>
                                                </Tr>
                                                <Tr>
                                                    <Th>Bezeichnung</Th>
                                                    <Td>
                                                        <Editable defaultValue={articleState.name} onSubmit={async (value) => {
                                                            setArticleData(({ ...articleState, name: value.trim() }));

                                                            try {
                                                                await submitArticle();

                                                                toast({
                                                                    title: 'Artikel gespeichert',
                                                                    description: 'Deine Änderungen an diesem Artikel wurden gespeichert',
                                                                    status: 'success',
                                                                    duration: 5000,
                                                                    isClosable: true
                                                                });
                                                            }
                                                            catch (e) {
                                                                toast({
                                                                    title: 'Fehler beim Speichern',
                                                                    description: 'Deine Änderungen an diesem Artikel konnten leider nicht gespeichert werden',
                                                                    status: 'error',
                                                                    duration: 10000,
                                                                    isClosable: true
                                                                });
                                                            }

                                                        }}>
                                                            <EditablePreview />
                                                            <EditableInput />
                                                        </Editable>
                                                    </Td>
                                                </Tr>
                                                <Tr>
                                                    <Th>Schlagworte</Th>
                                                    <Td>
                                                        <HStack justifyContent="flex-start">
                                                            {articleState.keywords.map((keyword) => (
                                                                <Link passHref key={keyword} href={`/keyword/${encodeURIComponent(keyword.toLocaleLowerCase())}`}>
                                                                    <a><Badge>{keyword}</Badge></a>
                                                                </Link>
                                                            ))}
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                                <Tr>
                                                    <Th>Mindestbestand</Th>
                                                    <Td>
                                                        {articleState.targetAmount}
                                                    </Td>
                                                </Tr>
                                                <Tr>
                                                    <Th>Füllstand</Th>
                                                    <Td>
                                                        <Progress max={articleState.targetAmount} value={totalStorageItems} />
                                                    </Td>
                                                </Tr>
                                            </Tbody>
                                        </Table>
                                    </Box>
                                </HStack>
                            )
                    }
                </Container>

                <Container maxWidth="container.xl">
                    <HStack marginBottom="4" justifyContent="space-between" paddingRight="6">
                        <Heading as="h2" size="lg">Aktuelle Lagerposten</Heading>
                        <Tooltip label="Neuen Lagerposten hinzufügen">
                            <IconButton size="sm"
                                icon={<AddIcon />}
                                aria-label="Einlagern"
                                onClick={() => setStoreItemModalOpen(true)}
                            />
                        </Tooltip>
                    </HStack>
                    {
                        storageItemsLoading
                            ? <Text>Lagerposten werden geladen</Text>
                            : storageItems.length === 0
                                ? <Text>Es sind keine Lagerposten vorhanden.</Text>
                                : (
                                    <Table size="md">
                                        <Thead>
                                            <Tr>
                                                <Th>Mindesthaltbarkeit</Th>
                                                <Th>Einlagerungsdatum</Th>
                                                <Th>Anzahl</Th>
                                                <Th isNumeric>Aktionen</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {
                                                storageItems.map((item) => (
                                                    <StorageItemRow key={item.uri}
                                                        resource={item}
                                                        takeButtonClickProvider={((resource: Resource<StorageItem>) => {
                                                            return () => {
                                                                setCurrentEditStorageItem(resource);
                                                            }
                                                        })}
                                                    />)
                                                )
                                            }
                                        </Tbody>
                                    </Table>
                                )
                    }
                </Container>
            </VStack>
        </>
    )
};

ArticlePage.getInitialProps = (context) => ({ gtin: context.query.gtin });

function StorageItemRow({ resource, takeButtonClickProvider }: { resource: Resource<StorageItem>, takeButtonClickProvider: (resource: Resource<StorageItem>) => () => void }) {
    const { loading, error, data } = useResource<StorageItem>(resource);

    if (error) return (
        <Tr key={data.toString()}>
            <Td colSpan={3}>{JSON.stringify(error)}</Td>
        </Tr>
    );

    if (data.amount < 1) return null;

    return (
        <Tr key={data.toString()}>
            {
                loading
                    ? <>
                        <Td><SkeletonText noOfLines={1} /></Td>
                        <Td><SkeletonText noOfLines={1} /></Td>
                        <Td><SkeletonText noOfLines={1} /></Td>
                        <Td isNumeric><SkeletonText noOfLines={1} /></Td>
                    </>
                    : <>
                        <Td>{DateTime.fromISO(data.bestBefore).toLocaleString({ dateStyle: 'medium' })} ({DateTime.fromISO(data.bestBefore).toRelativeCalendar()})</Td>
                        <Td>{DateTime.fromISO(data.storageDate).toLocaleString({ dateStyle: 'medium' })} ({DateTime.fromISO(data.storageDate).toRelativeCalendar()})</Td>
                        <Td>{data.amount}</Td>
                        <Td isNumeric>
                            <Tooltip label="Lagerposten entnehmen">
                                <IconButton size="xs"
                                    icon={<MinusIcon />}
                                    aria-label="Entnehmen"
                                    onClick={takeButtonClickProvider(resource)}
                                ></IconButton>
                            </Tooltip>
                        </Td>
                    </>
            }
        </Tr>
    );
}

export default ArticlePage
