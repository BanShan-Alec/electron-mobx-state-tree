import { ipcRenderer } from 'electron';

const electronAPI = {
    createWindow: () => ipcRenderer.send('create-window'),
};

type TElectronAPI = typeof electronAPI;

export type { TElectronAPI };

export { electronAPI };
