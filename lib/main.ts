import { ipcMain, type WebContents } from 'electron';
import { IPC_CHANNEL_NAME, isRenderer } from '.';
import { applyAction, getSnapshot, IAnyModelType, IModelType, onPatch } from 'mobx-state-tree';

export interface InitStoreOptionsType {
    store: IAnyModelType;
    snapshot?: any;
    observers?: WebContents[];
    createStoreBefore?: boolean;
}

export const initMST = (options: InitStoreOptionsType[]) => {
    if (isRenderer()) throw new Error('This module should be used in main process!');

    global.ElectronMSTMain = {
        storeMap: new Map(),
        storeObserverMap: new Map(),
        storeInstanceMap: new Map(),
        storeDestroyMap: new Map(),
    };

    options.forEach(({ store, createStoreBefore = false, snapshot, observers }) => {
        // 等待注册 store
        ElectronMSTMain.storeMap.set(store.name, store);
        if (createStoreBefore) {
            createStore(store, snapshot, { observers });
        }
    });

    ipcMain.handle(`${IPC_CHANNEL_NAME}:register`, async (event, data) => {
        if (!data.storeName) throw new Error('Store name is required!');
        if (!data.snapshot) throw new Error('Store Snapshot is required!');

        const store = ElectronMSTMain.storeMap.get(data.storeName);
        const storeInstance = ElectronMSTMain.storeInstanceMap.get(data.storeName);
        // 未创建的 store 先创建
        if (store && !storeInstance) {
            if (typeof store === 'undefined') throw new Error('Store not found! Please add Store to initMST()');
            createStore(store, data.snapshot, {
                observers: [event.sender],
            });
            return null;
        }
        // 已经存在的 store 直接返回快照
        const webContents = ElectronMSTMain.storeObserverMap.get(data.storeName) || [];
        ElectronMSTMain.storeObserverMap.set(data.storeName, [...webContents, event.sender]);
        const snapshot = getSnapshot(storeInstance);
        return snapshot;
    });
    ipcMain.on(`${IPC_CHANNEL_NAME}:destroy`, (event, data) => {
        if (!data.storeName) throw new Error('Store name is required!');
        destroyStore(data.storeName);
    });
};

export const createStore = <T extends IModelType<any, any>>(
    store: T,
    snapshot?: Parameters<T['create']>[0],
    options?: {
        observers?: WebContents[];
    }
) => {
    try {
        if (isRenderer()) {
            throw new Error('This module should be used in main process!');
        }
        if (typeof ElectronMSTMain === 'undefined') {
            throw new Error('Please call init() before createStore()!');
        }

        if (ElectronMSTMain.storeInstanceMap.has(store.name)) {
            throw new Error('Store name duplication!');
            // return ElectronMSTMain.storeInstanceMap.get(store.name);
        }

        const storeInstance = store.create(snapshot);
        const handleCallAction = (event: any, data: any) => {
            // TODO DEBUG
            // console.log('callAction', data.actionObj);

            if (!data.actionObj) return;
            applyAction(storeInstance, data.actionObj);
        };
        const handlePatch = (patch: any) => {
            // TODO DEBUG
            // console.log('patch', patch);

            const observers = ElectronMSTMain.storeObserverMap.get(store.name);

            if (typeof observers === 'undefined') return;
            observers.forEach((observer) => {
                if (observer.isDestroyed()) return;
                observer.send(`${IPC_CHANNEL_NAME}:patch-${store.name}`, { patch });
            });
            // 去除已经销毁的 observer
            ElectronMSTMain.storeObserverMap.set(
                store.name,
                observers.filter((observer) => !observer.isDestroyed())
            );
        };
        const handleDestroy = () => {
            ipcMain.off(`${IPC_CHANNEL_NAME}:callAction-${store.name}`, handleCallAction);
            ElectronMSTMain.storeObserverMap.delete(store.name);
            ElectronMSTMain.storeInstanceMap.delete(store.name);
        };

        ipcMain.on(`${IPC_CHANNEL_NAME}:callAction-${store.name}`, handleCallAction);
        onPatch(storeInstance, handlePatch);

        ElectronMSTMain.storeObserverMap.set(store.name, options?.observers || []);
        ElectronMSTMain.storeInstanceMap.set(store.name, storeInstance);
        ElectronMSTMain.storeDestroyMap.set(store.name, handleDestroy);

        return storeInstance;
    } catch (error: any) {
        console.error(`[createStore error] ${error?.message}`);
        throw error;
    }
};

export const destroyStore = (storeName: string) => {
    const destroy = ElectronMSTMain.storeDestroyMap.get(storeName);
    if (typeof destroy === 'function') {
        destroy();
    }
};

export const getStoreInstanceByName = (storeName: string) => {
    if (typeof ElectronMSTMain === 'undefined') {
        throw new Error('Please call initMST() before getStoreInstance!');
    }
    return ElectronMSTMain.storeInstanceMap.get(storeName);
};

export const getStoreInstance = <T extends IModelType<any, any>>(store: T) => {
    return getStoreInstanceByName(store.name) as T['Type'];
};
