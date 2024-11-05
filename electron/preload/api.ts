import { ipcRenderer, contextBridge } from 'electron'

const electronAPI = {
    createWindow: () => ipcRenderer.send('create-window')
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

type TElectronAPI = typeof electronAPI

export type { TElectronAPI }