import { ipcRenderer, contextBridge, type IpcRendererEvent } from 'electron';
import type { ISerializedActionCall } from 'mobx-state-tree';

import { IPC_CHANNEL_NAME, PRELOAD_BRIDGE_NAME } from './shared';

const ElectronMST = {
    register: async (storeName: string, curSnapshot?: any) => {
        const newSnapshot = await ipcRenderer.invoke(`${IPC_CHANNEL_NAME}:register`, {
            storeName,
            snapshot: curSnapshot,
        });
        return newSnapshot;
    },
    callAction: (storeName: string, actionObj: ISerializedActionCall) => {
        return ipcRenderer.send(`${IPC_CHANNEL_NAME}:callAction-${storeName}`, { actionObj });
    },
    onPatchChange: (storeName: string, listener: (patch: any) => void) => {
        const patchChannel = `${IPC_CHANNEL_NAME}:patch-${storeName}`;
        const handlePatchEvent = (_: IpcRendererEvent, data: any) => {
            if (!data.patch) return;
            listener(data.patch);
        };
        ipcRenderer.on(patchChannel, handlePatchEvent);
        return () => {
            ipcRenderer.off(patchChannel, handlePatchEvent);
        };
    },
    destroy: (storeName: string) => {
        ipcRenderer.send(`${IPC_CHANNEL_NAME}:destroy`, { storeName });
    },
};

type ElectronMSTType = typeof ElectronMST;

export type { ElectronMSTType };
export const exposeMSTBridge = () => {
    try {
        contextBridge.exposeInMainWorld(PRELOAD_BRIDGE_NAME, ElectronMST);
    } catch (error) {
        (window as any)[PRELOAD_BRIDGE_NAME] = ElectronMST;
    }
};
