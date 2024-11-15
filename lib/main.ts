import { ipcMain, type WebContents } from 'electron';
import { IPC_CHANNEL_NAME, isRenderer } from '.';
import { applyAction, getSnapshot, IAnyModelType, IAnyStateTreeNode, IModelType, onPatch } from 'mobx-state-tree';

export interface InitStoreOptionsType {
    store: IAnyModelType;
    snapshot?: any;
    observers?: WebContents[];
    createStoreBefore?: boolean;
}

class StoreManager {
    static initialized = false;
    private static storeMap: Map<string, IAnyModelType>;
    private static storeObserverMap: Map<string, WebContents[]>;
    private static storeInstanceMap: Map<string, IAnyStateTreeNode>;
    private static storeDestroyMap: Map<string, () => void>;

    static init(options: InitStoreOptionsType[]) {
        this.storeMap = new Map();
        this.storeObserverMap = new Map();
        this.storeInstanceMap = new Map();
        this.storeDestroyMap = new Map();

        options.forEach(({ store, createStoreBefore = false, snapshot, observers }) => {
            // 等待注册
            this.storeMap.set(store.name, store);
            // 预先创建，不等待注册（用于主进程也消费Store实例的场景）
            if (createStoreBefore) {
                this.createStore(store, snapshot, { observers });
            }
        });

        this.initialized = true;
    }

    static getInstanceByName(storeName: string) {
        return this.storeInstanceMap.get(storeName);
    }

    static getStoreByName(storeName: string) {
        return this.storeMap.get(storeName);
    }

    static destroyStoreByName(storeName: string) {
        const destroy = this.storeDestroyMap.get(storeName);
        if (typeof destroy === 'function') destroy();
    }

    static addObserver(storeName: string, observer: WebContents) {
        const observers = this.storeObserverMap.get(storeName);
        if (typeof observers === 'undefined') return;

        this.storeObserverMap.set(storeName, [...observers, observer]);
    }

    static createStore<T extends IModelType<any, any>>(
        store: T,
        snapshot?: Parameters<T['create']>[0],
        options?: {
            observers?: WebContents[];
        }
    ) {
        try {
            // 检查
            if (isRenderer()) {
                throw new Error('This module should be used in main process!');
            }
            if (!this.initialized) {
                throw new Error('Please call initMST() before createStore()!');
            }

            if (this.storeInstanceMap.has(store.name)) {
                throw new Error('Store name duplication!');
            }

            // 实例化
            const storeInstance = store.create(snapshot);
            this.storeObserverMap.set(store.name, options?.observers || []);
            this.storeInstanceMap.set(store.name, storeInstance);

            // 事件处理
            const handleCallAction = (event: any, data: any) => {
                // TODO DEBUG
                // console.log('callAction', data.actionObj);

                if (!data.actionObj) return;
                applyAction(storeInstance, data.actionObj);
            };
            const handlePatch = (patch: any) => {
                // TODO DEBUG
                // console.log('patch', patch);

                const observers = this.storeObserverMap.get(store.name);
                if (typeof observers === 'undefined') return;

                observers.forEach((observer) => {
                    if (observer.isDestroyed()) return;
                    observer.send(`${IPC_CHANNEL_NAME}:patch-${store.name}`, { patch });
                });
                // 去除已经销毁的 observer
                this.storeObserverMap.set(
                    store.name,
                    observers.filter((observer) => !observer.isDestroyed())
                );
            };
            const handleDestroy = () => {
                ipcMain.off(`${IPC_CHANNEL_NAME}:callAction-${store.name}`, handleCallAction);
                this.storeObserverMap.delete(store.name);
                this.storeInstanceMap.delete(store.name);
            };

            // 注册事件
            ipcMain.on(`${IPC_CHANNEL_NAME}:callAction-${store.name}`, handleCallAction);
            onPatch(storeInstance, handlePatch);
            this.storeDestroyMap.set(store.name, handleDestroy);
            // 返回实例
            return storeInstance;
        } catch (error: any) {
            console.error(`[createStore error] ${error?.message}`);
            throw error;
        }
    }
}

export const initMST = (options: InitStoreOptionsType[]) => {
    if (isRenderer()) throw new Error('This module should be used in main process!');

    StoreManager.init(options);

    ipcMain.handle(`${IPC_CHANNEL_NAME}:register`, async (event, data) => {
        if (!data.storeName) throw new Error('Store name is required!');
        if (!data.snapshot) throw new Error('Store Snapshot is required!');

        const store = StoreManager.getStoreByName(data.storeName);
        const storeInstance = StoreManager.getInstanceByName(data.storeName);
        if (!store) throw new Error('Store not found! Please add Store to initMST() first!');

        // 已经存在的 store实例 直接返回快照
        if (store && storeInstance) {
            StoreManager.addObserver(data.storeName, event.sender);
            const snapshot = getSnapshot(storeInstance);
            return snapshot;
        }
        // 不存在的则创建
        StoreManager.createStore(store, data.snapshot, {
            observers: [event.sender],
        });
        return null;
    });

    ipcMain.on(`${IPC_CHANNEL_NAME}:destroy`, (event, data) => {
        if (!data.storeName) throw new Error('Store name is required!');
        StoreManager.destroyStoreByName(data.storeName);
    });
};

export const destroyStore = (store: IAnyModelType) => {
    StoreManager.destroyStoreByName(store.name);
};

export const destroyStoreByName = (storeName: string) => {
    StoreManager.destroyStoreByName(storeName);
};

export const getStoreInstance = <T extends IModelType<any, any>>(store: T) => {
    return StoreManager.getInstanceByName(store.name) as T['Type'] | undefined;
};

export const getStoreInstanceByName = (storeName: string) => {
    return StoreManager.getInstanceByName(storeName);
};
