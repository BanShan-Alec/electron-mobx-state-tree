import { BrowserWindow, ipcMain, WebContents } from 'electron';
import { IPC_CHANNEL_NAME } from '../constant';
import { applyAction, getSnapshot, IModelType, onPatch } from 'mobx-state-tree';

const storeObserverMap = new Map<string, WebContents[]>();
const storeInstanceMap = new Map<string, any>();

ipcMain.handle(`${IPC_CHANNEL_NAME}:register`, async (event, data) => {
    if (!data.storeName) throw new Error('Store name is required!');
    const webContents = storeObserverMap.get(data.storeName);
    if (typeof webContents === 'undefined') throw new Error('Store not found!');

    storeObserverMap.set(data.storeName, [...webContents, event.sender]);
    const snapshot = getSnapshot(storeInstanceMap.get(data.storeName));
    return snapshot;
});

export const createStore = <T extends IModelType<any, any>>(
    store: T,
    snapshot?: Parameters<T['create']>[0],
    options?: any
) => {
    try {
        if (storeInstanceMap.has(store.name)) {
            // throw new Error('Store name duplication!');
            return storeInstanceMap.get(store.name);
        }

        const storeInstance = store.create(snapshot);
        storeObserverMap.set(store.name, []);
        storeInstanceMap.set(store.name, storeInstance);

        ipcMain.on(`${IPC_CHANNEL_NAME}:callAction-${store.name}`, (_, data) => {
            console.log(data);

            if (!data.actionObj) return;
            applyAction(storeInstance, data.actionObj);
        });

        onPatch(storeInstance, (patch) => {
            const observers = storeObserverMap.get(store.name);
            console.log('patch', patch);

            if (typeof observers === 'undefined') return;
            observers.forEach((observer) => {
                if (observer.isDestroyed()) return;
                observer.send(`${IPC_CHANNEL_NAME}:patch-${store.name}`, { patch });
            });
            // 去除已经销毁的 observer
            storeObserverMap.set(
                store.name,
                observers.filter((observer) => !observer.isDestroyed())
            );
        });

        return storeInstance;
    } catch (error: any) {
        console.error(`[createStore error] ${error?.message}`);
        throw error;
    }
};
