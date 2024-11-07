interface ElectronMSTMainType {
    // Map的key都是取store.name
    storeMap: Map<string, IAnyModelType>;
    storeObserverMap: Map<string, WebContents[]>;
    storeInstanceMap: Map<string, any>;
    storeDestroyMap: Map<string, () => void>;
}

var ElectronMSTMain: ElectronMSTMainType;

interface Window {
    ElectronMST: import('./preload').ElectronMSTType;
}

var ElectronMST: import('./preload').ElectronMSTType;
