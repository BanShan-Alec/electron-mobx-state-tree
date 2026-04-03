import type { IModelType } from 'mobx-state-tree';

import { createStore as createStoreRender } from './render';
export { IPC_CHANNEL_NAME, PRELOAD_BRIDGE_NAME, isRenderer } from './shared';
import { isRenderer } from './shared';

export const createStore = <T extends IModelType<any, any>>(
    store: T,
    snapshot?: Parameters<T['create']>[0],
    options?: any
): T['Type'] => {
    if (isRenderer()) {
        return createStoreRender(store, snapshot, options);
    }
};
