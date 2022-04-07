import { Resource } from 'ketting';
import { DateTime } from 'luxon';
import { StorageItem } from '../model/StorageItem';

const StorageItemService = {
    async removeItemFromStorage(storageItem: Resource<StorageItem>, itemCount: number) {
        if (itemCount < 1) throw new Error("Must take at least 1 item!");

        const state = await storageItem.get();
        const newAmount = state.data.amount - itemCount;

        await storageItem.put({
            data: {
                ...state.data,
                amount: newAmount
            }
        });

        await storageItem.refresh();
    },

    async storeItem(storageItemsCollection: Resource<StorageItem>, itemCount: number, bestbefore: Date, articleUri: string) {
        await storageItemsCollection.post({
            data: {
                amount: itemCount,
                bestBefore: DateTime.fromJSDate(bestbefore).toISO(),
                storageDate: DateTime.local().toISO(),
                article: articleUri
            }
        })

        storageItemsCollection.clearCache();
    }
};

export default StorageItemService;
