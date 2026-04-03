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
