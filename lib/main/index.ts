import { BrowserWindow, ipcMain, WebContents } from 'electron';
import { IPC_CHANNEL_NAME } from '../constant';
import { applyAction, getSnapshot, IModelType, onPatch } from 'mobx-state-tree';

const storeObserverMap = new Map<string, WebContents[]>();
const storeInstanceMap = new Map<string, any>();
const storeDestroyMap = new Map<string, () => void>();

ipcMain.handle(`${IPC_CHANNEL_NAME}:register`, async (event, data) => {
    if (!data.storeName) throw new Error('Store name is required!');
    const webContents = storeObserverMap.get(data.storeName);
    if (typeof webContents === 'undefined') throw new Error('Store not found!');

    storeObserverMap.set(data.storeName, [...webContents, event.sender]);
    const snapshot = getSnapshot(storeInstanceMap.get(data.storeName));
    return snapshot;
});
ipcMain.on(`${IPC_CHANNEL_NAME}:destroy`, (event, data) => {
    if (!data.storeName) throw new Error('Store name is required!');
    destroyStore(data.storeName);
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
        const handleCallAction = (event: any, data: any) => {
            // TODO DEBUG
            console.log('callAction', data.actionObj);

            if (!data.actionObj) return;
            applyAction(storeInstance, data.actionObj);
        };
        const handlePatch = (patch: any) => {
            // TODO DEBUG
            console.log('patch', patch);

            const observers = storeObserverMap.get(store.name);

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
        };
        const handleDestroy = () => {
            ipcMain.off(`${IPC_CHANNEL_NAME}:callAction-${store.name}`, handleCallAction);
            storeObserverMap.delete(store.name);
            storeInstanceMap.delete(store.name);
        };

        ipcMain.on(`${IPC_CHANNEL_NAME}:callAction-${store.name}`, handleCallAction);
        onPatch(storeInstance, handlePatch);

        storeObserverMap.set(store.name, []);
        storeInstanceMap.set(store.name, storeInstance);
        storeDestroyMap.set(store.name, handleDestroy);

        return storeInstance;
    } catch (error: any) {
        console.error(`[createStore error] ${error?.message}`);
        throw error;
    }
};

export const destroyStore = (storeName: string) => {
    const destroy = storeDestroyMap.get(storeName);
    if (typeof destroy === 'function') {
        destroy();
    }
};
