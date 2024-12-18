import { ipcMain, IpcMainEvent, type WebContents } from 'electron';
import { IPC_CHANNEL_NAME, isRenderer } from '.';
import { applyAction, getSnapshot, IAnyModelType, IAnyStateTreeNode, IModelType, onPatch } from 'mobx-state-tree';

export interface InitStoreOptionsType {
    store: IAnyModelType;
    snapshot?: any;
    observers?: WebContents[];
}

class MSTStore {
    store: IAnyModelType;
    defaultSnapshot: any;
    observers: WebContents[] = [];
    storeInstance: IAnyStateTreeNode = null;
    latestPatcher?: WebContents;
    destroy: () => void = () => void 0;

    constructor(store: IAnyModelType, snapshot?: any) {
        this.store = store;
        this.defaultSnapshot = snapshot;
    }

    create<T extends IModelType<any, any>>(
        store: T,
        snapshot?: Parameters<T['create']>[0],
        options?: {
            observers?: WebContents[];
        }
    ): T['Type'] {
        const { observers } = options || {};
        this.storeInstance = store.create(snapshot);
        // 保存观察者
        this.observers = observers || [];
        // 注册事件
        ipcMain.on(`${IPC_CHANNEL_NAME}:callAction-${store.name}`, this.handleCallAction);
        const offPatchListener = onPatch(this.storeInstance, this.handlePatch);
        // 销毁事件
        this.destroy = () => {
            offPatchListener();
            ipcMain.off(`${IPC_CHANNEL_NAME}:callAction-${this.store.name}`, this.handleCallAction);
            this.observers = [];
            this.storeInstance = null;
            this.latestPatcher = undefined;
        };

        return this.storeInstance;
    }

    // 事件处理
    private handleCallAction = (event: IpcMainEvent, data: any) => {
        // TODO DEBUG
        // console.log('callAction', data.actionObj, event.sender.id);

        if (!data.actionObj) return;
        this.latestPatcher = event.sender;
        // applyAction后会马上触发onPatch是同步的
        applyAction(this.storeInstance, data.actionObj);
    };
    private handlePatch = (patch: any) => {
        // TODO DEBUG
        // console.log('patch', patch, this.latestPatcher.id);

        this.observers.forEach((observer) => {
            if (observer.isDestroyed()) return;
            // 避免重复发送Patch
            if (observer === this.latestPatcher) return;
            observer.send(`${IPC_CHANNEL_NAME}:patch-${this.store.name}`, { patch });
        });
        // 去除已经销毁的 observer
        this.observers = this.observers.filter((observer) => !observer.isDestroyed());
        this.latestPatcher = undefined;
    };
}

class StoreManager {
    private static mstStoreMap: Map<string, MSTStore>;

    static init(options: InitStoreOptionsType[]) {
        this.mstStoreMap = new Map();

        options.forEach(({ store, snapshot, observers }) => {
            // 等待渲染进程请求注册 or 主进程消费Store实例
            this.mstStoreMap.set(store.name, new MSTStore(store, snapshot));
        });

        ipcMain.handle(`${IPC_CHANNEL_NAME}:register`, this.handleRegister);
        ipcMain.on(`${IPC_CHANNEL_NAME}:destroy`, this.handleDestroy);
    }

    static destroy() {
        ipcMain.off(`${IPC_CHANNEL_NAME}:register`, this.handleRegister);
        ipcMain.off(`${IPC_CHANNEL_NAME}:destroy`, this.handleDestroy);
        this.mstStoreMap.forEach((mstStore) => {
            mstStore.destroy();
        });
        this.mstStoreMap.clear();
    }

    static getInstanceByName(storeName: string) {
        return this.mstStoreMap.get(storeName)?.storeInstance;
    }

    static getStoreByName(storeName: string) {
        return this.mstStoreMap.get(storeName)?.store;
    }

    static destroyStoreByName(storeName: string) {
        return this.mstStoreMap.get(storeName)?.destroy();
    }

    static addObservers(storeName: string, observer: WebContents[]) {
        const mstStore = this.mstStoreMap.get(storeName);
        if (!mstStore) return;
        mstStore.observers.push(...observer);
    }

    static createStore: MSTStore['create'] = (store, snapshot, options) => {
        try {
            // 检查
            if (isRenderer()) {
                throw new Error('This module should be used in main process!');
            }
            const mstStore = this.mstStoreMap.get(store.name);

            if (!mstStore) {
                throw new Error(`Please add Store "${store.name}" to initMST() before createStore()!`);
            }

            if (mstStore.storeInstance) {
                throw new Error(`Store name "${store.name}" duplication!`);
            }

            // 实例化
            const _snapshot = snapshot || mstStore.defaultSnapshot;
            const storeInstance = mstStore.create(store, _snapshot, options);
            // 返回实例
            return storeInstance;
        } catch (error: any) {
            error.message = `[Electron-MST error] ${error.message}`;
            throw error;
        }
    };

    private static handleRegister = async (event: any, data: any) => {
        if (!data.storeName) throw new Error('Store name is required!');
        if (!data.snapshot) throw new Error('Store Snapshot is required!');

        const store = this.getStoreByName(data.storeName);
        const storeInstance = this.getInstanceByName(data.storeName);
        if (!store) throw new Error(`Store "${data.storeName}" not found! Please add Store to initMST() first!`);

        // 已经存在的 store实例 直接返回快照
        if (store && storeInstance) {
            this.addObservers(data.storeName, [event.sender]);
            const snapshot = getSnapshot(storeInstance);
            return snapshot;
        }
        // 不存在的则创建
        this.createStore(store, data.snapshot, {
            observers: [event.sender],
        });
        return null;
    };

    private static handleDestroy = (event: any, data: any) => {
        if (!data.storeName) throw new Error('Store name is required!');
        this.destroyStoreByName(data.storeName);
    };
}

export const initMST = (options: Array<IAnyModelType | InitStoreOptionsType>) => {
    if (isRenderer()) throw new Error('This module should be used in main process!');
    const _options = options.map((option) => {
        if (option instanceof Object && Object.keys(option).find((key) => key === 'store')) {
            return option as InitStoreOptionsType;
        }
        return { store: option } as InitStoreOptionsType;
    });
    StoreManager.init(_options);
};

export const destroyMST = () => {
    if (isRenderer()) throw new Error('This module should be used in main process!');
    StoreManager.destroy();
};

export const destroyStore = (store: IAnyModelType) => {
    StoreManager.destroyStoreByName(store.name);
};

export const destroyStoreByName = (storeName: string) => {
    StoreManager.destroyStoreByName(storeName);
};

export const getStoreInstance = <T extends IModelType<any, any>>(store: T) => {
    if (!StoreManager.getStoreByName(store.name)) {
        throw new Error(`Store "${store.name}" not found! Please add Store to initMST() first!`);
    }

    const instance = StoreManager.getInstanceByName(store.name) || StoreManager.createStore(store);
    return instance as T['Type'];
};

export const getStoreInstanceByName = (storeName: string) => {
    return StoreManager.getInstanceByName(storeName);
};
