import { ipcRenderer, contextBridge } from 'electron';
import { IPC_CHANNEL_NAME } from '../constant';
import { ISerializedActionCall } from 'mobx-state-tree';

const ElectronMST = {
    register: async (storeName: string) => {
        const snapshot = await ipcRenderer.invoke(`${IPC_CHANNEL_NAME}:register`, { storeName });
        return snapshot;
    },
    callAction: (storeName: string, actionObj: ISerializedActionCall) => {
        console.log('callAction', storeName, actionObj);

        return ipcRenderer.send(`${IPC_CHANNEL_NAME}:callAction-${storeName}`, { actionObj });
    },
};

type ElectronMSTType = typeof ElectronMST;

export type { ElectronMSTType };
export const exposeBridge = () => {
    try {
        contextBridge.exposeInMainWorld('ElectronMST', ElectronMST);
    } catch (error) {
        window.ElectronMST = ElectronMST;
    }
};
