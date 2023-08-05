import { BrowserWindow } from "electron";


/**
 * Check `WindowManageInstanceData` for more info
 */
export interface WindowManageInstanceDataConfig {
    instance: BrowserWindow;
    name?: string;
}

/**
 * Data store in the window management of a `BrowserWindow`
 * 
 * Including `BrowserWindow` instance itself, and some metadata 
 * which used by window management like `name`, etc
 * 
 * Notice:
 * - `name` will be default to "unnamed" if it was undefined when 
 * initializing 
 */
export class WindowManageInstanceData {
    constructor({
        instance,
        name,
    }: WindowManageInstanceDataConfig) {
        // set default 
        if (name === undefined) {
            name = 'unnamed';
        }
        // set instance property
        this.instance = instance;
        this.name = name;
    }

    /**`BrowserWindow` instance of this data */
    instance: BrowserWindow;

    /**Name of this instance */
    name: string;
};


interface windowInstanceConfig {
    /**Main window of the app */
    mainWindow: BrowserWindow | null;
    /**
     * List of opened windows, not included `mainWindow`
     */
    windowsList: WindowManageInstanceData[];
}


export let windowInstance: windowInstanceConfig = {
    mainWindow: null,
    windowsList: [],
}

export interface sendToAllWindowsConfig {
    /**If this messaeg also should send to mainWindow */
    includeMain?: boolean;
    /**Channel used to send the info */
    channel: string;
    /**
     * Params passed to message receiver
     * 
     * Notice:
     * - This params should be a list with any type (`any[]`), and 
     * the params in the list will be expand between send to render process, 
     * e.g.: `props = [a, b]` will cause `send(a, b)`
     * 
     * If you want to pass single prop as the param, you should wrap the prop 
     * with a list, e.g.: `props=[{a: 1, b: 2}]`
     */
    props: any[];
}

/**
 * Send info to all windows through IPC
 * 
 * Params:
 * - Check `windowInstanceConfig` for more info
 */
export function sendToAllWindows({
    includeMain,
    channel,
    props,
}
    : sendToAllWindowsConfig) {
    // set default
    if (includeMain === undefined) {
        includeMain = true;
    }
    // send msg
    for (let win of windowInstance.windowsList) {
        win.instance.webContents.send(channel, ...props);
    }
    // send to main if needed
    if (includeMain === true) {
        windowInstance.mainWindow.webContents.send(channel, ...props);
    }
}