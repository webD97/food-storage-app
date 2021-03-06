import { Heading, SkeletonText, Table, Tbody, Td, Thead, Tr, Text, Container, VStack, Th, IconButton, HStack, Tooltip, useToast, Box, Image } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { useCollection, useResource } from 'react-ketting';
import type { Article } from '../../model/Article';
import type { StorageItem } from '../../model/StorageItem';
import { Resource } from 'ketting';
import { DateTime } from 'luxon';
import { AddIcon, EditIcon, MinusIcon } from '@chakra-ui/icons';
import { AddAPhoto } from '@mui/icons-material';
import TakeItemModal from '../../components/TakeItemModal';
import { useCallback, useState } from 'react';
import StoreItemModal from '../../components/StoreItemModal';
import StorageItemService from '../../service/StorageItemService';
import ToastService from '../../service/ToastService';
import ArticleInfoTable from '../../components/ArticleInfoTable';
import ArticleImage from '../../components/ArticleImage';

interface ArticlePageProps {
    gtin: string | string[] | undefined
}

const ArticlePage: NextPage<ArticlePageProps> = ({ gtin }) => {
    const toast = useToast();

    const [currentEditStorageItem, setCurrentEditStorageItem] = useState<Resource<StorageItem> | undefined>();
    const [storeItemModalOpen, setStoreItemModalOpen] = useState(false);
    const [articleEditMode, setArticleEditMode] = useState(false);

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

    const onSaveButtonClicked = useCallback(async (article) => {
        if (JSON.stringify(article) === JSON.stringify(articleState)) {
            setArticleEditMode(false);
            return;
        }

        try {
            setArticleData({ ...articleState, ...article })
            await submitArticle();
            setArticleEditMode(false);
            ToastService.updateArticleSuccess(toast);
        }
        catch (e) {
            console.error(e);
            ToastService.updateArticleFailed(toast);
        }
    }, [articleState, setArticleData, submitArticle, toast]);

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
                                    <ArticleImage src="/4388840219872.webp" onImageUpdated={(url) => console.log(url)} />
                                    <Box flexGrow={1}>
                                        <HStack marginBottom="4" paddingRight="6" justifyContent="space-between">
                                            <Heading as="h2" size="lg">{articleState?.name}</Heading>
                                            {
                                                articleEditMode === true
                                                    ? null
                                                    : (
                                                        <Tooltip label="Artikel bearbeiten">
                                                            <IconButton aria-label="Bearbeiten" size="sm" icon={<EditIcon />} onClick={() => setArticleEditMode(true)} />
                                                        </Tooltip>
                                                    )
                                            }
                                        </HStack>
                                        <ArticleInfoTable size="md"
                                            article={articleState}
                                            editMode={articleEditMode}
                                            onCancelButtonClicked={() => setArticleEditMode(false)}
                                            onSaveButtonClicked={onSaveButtonClicked}
                                        />
                                    </Box>
                                </HStack>
                            )
                    }
                </Container>

                <Container maxWidth="container.xl">
                    <HStack marginBottom="4" justifyContent="space-between" paddingRight="6">
                        <Heading as="h2" size="lg">Aktuelle Lagerposten</Heading>
                        <Tooltip label="Neuen Lagerposten hinzuf??gen">
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
