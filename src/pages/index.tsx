import { Container, Heading, IconButton, SkeletonText, Table, Tbody, Td, Th, Thead, Tooltip, Tr, useToast } from '@chakra-ui/react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useCollection, useResource } from 'react-ketting';
import { Article } from '../model/Article';
import { Resource } from 'ketting';
import { StorageItem } from '../model/StorageItem';
import { DateTime } from 'luxon';
import { MinusIcon } from '@chakra-ui/icons';
import TakeItemModal from '../components/TakeItemModal';
import { useState, useCallback } from 'react';
import StorageItemService from '../service/StorageItemService';
import ToastService from '../service/ToastService';

const Home: NextPage = () => {
  const toast = useToast();
  const {
    loading: isLoadingStorageItems,
    error: storageItemsError,
    items: storageItems,
  } = useCollection<StorageItem>('storageItems', { refreshOnStale: true });

  const [currentEditStorageItem, setCurrentEditStorageItem] = useState<Resource<StorageItem> | undefined>();

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

  return (
    <>
      <Heading as="h2" size="lg">Aktuelle Lagerposten</Heading>

      <TakeItemModal
        open={currentEditStorageItem !== undefined}
        onClose={onCloseTakeItemModal}
        onSubmit={onSubmitTakeItemModal}
        itemMaxCount={currentEditStorageItem?.getCache()?.data.amount || 0}
      />

      <Container maxWidth="container.xl">
        <Table>
          <Thead>
            <Tr>
              <Th>Artikelbezeichnung</Th>
              <Th>Menge</Th>
              <Th>Mindestens haltbar bis</Th>
              <Th>Aktionen</Th>
            </Tr>
          </Thead>
          <Tbody>
            {
              isLoadingStorageItems
                ? new Array(5).fill(1).map((_, index) =>
                  <Tr key={index}>
                    <Td><SkeletonText noOfLines={1} /></Td>
                    <Td><SkeletonText noOfLines={1} /></Td>
                    <Td><SkeletonText noOfLines={1} /></Td>
                    <Td><SkeletonText noOfLines={1} /></Td>
                  </Tr>
                )
                : storageItems
                  .map(resource => <StorageItemRow key={resource.uri}
                    resource={resource}
                    onTakeButtonClickProvider={(storageItem: Resource<StorageItem>) => () => {
                      setCurrentEditStorageItem(storageItem);
                    }}
                  />
                  )
            }
          </Tbody>
        </Table>
      </Container>
    </>
  )
}

function StorageItemRow({ resource, onTakeButtonClickProvider }: { resource: Resource<StorageItem>, onTakeButtonClickProvider: (resource: Resource<StorageItem>) => () => void }) {
  const {
    loading: storageItemLoading,
    error: storageItemError,
    data: storageItemData,
    resourceState: storageItemState
  } = useResource<StorageItem>(resource);

  const {
    data: articleData,
    loading: articleLoading
  } = useResource<Article>(storageItemState.follow('article'));

  if (storageItemLoading) return <div>loading...</div>;
  if (storageItemError) return <div className="error">boo</div>;

  if (storageItemData.amount < 1) return null;

  return (
    <Tr key={resource.uri}>
      <Td>
        {
          articleLoading
            ? <SkeletonText noOfLines={1} />
            : (
              <Link href={`/articles/${encodeURIComponent(articleData.gtin)}`}>
                <a>{articleData.name}</a>
              </Link>
            )
        }
      </Td>
      <Td>
        {
          articleLoading
            ? storageItemData.amount
            : (
              <Link href={`/articles/${encodeURIComponent(articleData.gtin)}`}>
                <a>{storageItemData.amount}</a>
              </Link>
            )
        }
      </Td>
      <Td>
        {
          articleLoading
            ? storageItemData.amount
            : (
              <Link href={`/articles/${encodeURIComponent(articleData.gtin)}`}>
                <a>{DateTime.fromISO(storageItemData.bestBefore).toRelativeCalendar()}</a>
              </Link>
            )
        }
      </Td>
      <Td isNumeric>
        {
          articleLoading
            ? (
              <IconButton disabled
                size="xs"
                icon={<MinusIcon />}
                aria-label="Entnehmen"
              />
            )
            : (
              <Tooltip label="Schnelle Entnahme">
                <IconButton size="xs"
                  icon={<MinusIcon />}
                  aria-label="Entnehmen"
                  onClick={onTakeButtonClickProvider(resource)}
                />
              </Tooltip>
            )
        }
      </Td>
    </Tr>
  );

}

export default Home
