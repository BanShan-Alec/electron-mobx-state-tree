import { ipcRenderer, contextBridge, IpcRendererEvent } from 'electron';
import { IPC_CHANNEL_NAME } from '../constant';
import { ISerializedActionCall } from 'mobx-state-tree';

const ElectronMST = {
    register: async (storeName: string) => {
        const snapshot = await ipcRenderer.invoke(`${IPC_CHANNEL_NAME}:register`, { storeName });
        return snapshot;
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
        contextBridge.exposeInMainWorld('ElectronMST', ElectronMST);
    } catch (error) {
        window.ElectronMST = ElectronMST;
    }
};
