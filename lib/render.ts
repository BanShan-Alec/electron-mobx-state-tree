import { isRenderer } from '.';
import {
    applyPatch,
    applySnapshot,
    getChildType,
    getPath,
    getSnapshot,
    IModelType,
    isModelType,
} from 'mobx-state-tree';

const getStoreInstanceHandler = (storeName: string): ProxyHandler<any> => ({
    get(target, key, receiver) {
        const value = Reflect.get(target, key, receiver);

        if (typeof value === 'object' && isModelType(getChildType(target, key as string))) {
            // 递归代理，使得嵌套的 model 也能触发 action
            return new Proxy(value, getStoreInstanceHandler(storeName));
        }
        if (typeof value === 'function' && !!value._isMSTAction) {
            // TODO DEBUG
            // console.log('action', key, !!value._isMSTAction);

            return (...args: any) => {
                try {
                    const res = value.apply(this, args);
                    // TODO FEATURE: 在同一事件循环中，合并多个相同path的action
                    window.ElectronMST.callAction(storeName, {
                        name: key as string,
                        path: getPath(target),
                        args,
                    });
                    return res;
                } catch (error: any) {
                    console.error(`[storeInstanceHandler error] ${error?.message}`);
                    throw error;
                }
            };
        }
        return value;
    },
});

const initStore = async (storeName: string, storeInstance: any) => {
    const snapshot = await window.ElectronMST.register(storeName, getSnapshot(storeInstance));
    if (snapshot) applySnapshot(storeInstance, snapshot);

    const offPatchListener = window.ElectronMST.onPatchChange(storeName, (patch: any) => {
        // TODO DEBUG
        // console.log(`[onPatchChange] ${storeName}`, patch);
        applyPatch(storeInstance, patch);
    });
    window.addEventListener('beforeunload', () => {
        offPatchListener();
    });
};

export const createStore = <T extends IModelType<any, any>>(
    store: T,
    snapshot?: Parameters<T['create']>[0],
    options?: any
) => {
    try {
        if (!isRenderer()) {
            throw new Error('This module should be used in renderer process!');
        }
        if (typeof window.ElectronMST !== 'object') {
            throw new Error('ElectronMSTBridge is not available! Please check preload script.');
        }
        const storeInstance = store.create(snapshot);

        initStore(store.name, storeInstance);

        return new Proxy(storeInstance, getStoreInstanceHandler(store.name)) as typeof storeInstance;
    } catch (error: any) {
        console.error(`[createStore error] ${error?.message}`);
        throw error;
    }
};

export const destroyStore = (storeName: string) => {
    window.ElectronMST.destroy(storeName);
};
