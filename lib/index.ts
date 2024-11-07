import { createStore as createStoreRender } from './render';
import { IModelType } from 'mobx-state-tree';

export const IPC_CHANNEL_NAME = '__ElectronMST';
export const PRELOAD_BRIDGE_NAME = 'ElectronMST';

export function isRenderer() {
    // running in a web browser
    if (typeof process === 'undefined') return true;

    // node-integration is disabled
    if (!process) return true;

    // We're in node.js somehow
    if (!process.type) return false;

    return process.type === 'renderer';
}

export const createStore = <T extends IModelType<any, any>>(
    store: T,
    snapshot?: Parameters<T['create']>[0],
    options?: any
): T['Type'] => {
    if (isRenderer()) {
        return createStoreRender(store, snapshot, options);
    }
};
