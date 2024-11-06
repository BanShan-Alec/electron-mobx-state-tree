import { applyPatch, applySnapshot, getPath, IAnyModelType, IModelType } from 'mobx-state-tree';
import { IPC_CHANNEL_NAME } from '../constant';

const getStoreInstanceHandler = (storeName: string): ProxyHandler<any> => ({
    get(target, key, receiver) {
        const value = Reflect.get(target, key, receiver);
        // if (!!value._isMSTAction) {
        if (typeof value === 'function') {
            return (...args: any) => {
                try {
                    const res = value.apply(this, args);
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

export const createStore = <T extends IModelType<any, any>>(
    store: T,
    snapshot?: Parameters<T['create']>[0],
    options?: any
) => {
    try {
        if (typeof window?.ElectronMST !== 'object') {
            throw new Error('ElectronMSTBridge is not available! Please check preload script.');
        }
        const storeInstance = store.create(snapshot);

        const init = async () => {
            const snapshot = await window.ElectronMST.register(store.name);
            applySnapshot(storeInstance, snapshot);

            const patchChannel = `${IPC_CHANNEL_NAME}:patch-${store.name}`;
            window.ipcRenderer.on(patchChannel, (_, data) => {
                if (!data.patch) return;
                applyPatch(storeInstance, data.patch);
            });
            window.addEventListener('beforeunload', () => {
                window.ipcRenderer.removeAllListeners(patchChannel);
            });
        };

        init();

        return new Proxy(storeInstance, getStoreInstanceHandler(store.name)) as typeof storeInstance;
    } catch (error: any) {
        console.error(`[createStore error] ${error?.message}`);
        throw error;
    }
};
