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
 * initializing. This is NOT recommend and every window should has 
 * a unique `name`
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

class WindowInstance {
    constructor() {
        this.mainWindow = null;
        this.windowsList = [];
    }
    /**Main window of the app */
    mainWindow: BrowserWindow | null;
    /**
     * List data of opened windows, not included `mainWindow`
     */
    windowsList: WindowManageInstanceData[];

    /**
     * Add new window into `windowInstance.windowsList`
     */
    addNameWindow(name: string, window: BrowserWindow): void {
        this.windowsList.push(new WindowManageInstanceData({
            instance: window,
            name: name,
        }));
    }

    /**
     * Returns the first `WindowManageInstanceData` instance with specified `name`
     * 
     * Notice:
     * - If no window with the specified name found, return `undefined`
     * - You can use `getNameWindow(name) === undefined` to check if a window with 
     * specified name is already in the list
     */
    getNameWindow(name: string): WindowManageInstanceData | undefined {
        for (let winData of this.windowsList) {
            if (winData.name === name) {
                return winData;
            }
        }
        return undefined;
    }

    /**
     * Remove ALL window instance with specified `name`
     * 
     * Notice:
     * - This method should only be called when you are certain that 
     * a window with specified `name` has been closed. Usually should be 
     * called in `BrowserWindow` `closed` event
     */
    removeNameWindow(name: string) {
        let len = this.windowsList.length;
        for (let i = 0; i < len; ++i) {
            if (this.windowsList[i].name === name) {
                this.windowsList.splice(i, 1);
                --i;
                --len;
            }
        }
    }

    /**
     * Send info to all windows through IPC
     * 
     * Params:
     * - Check `windowInstanceConfig` for more info
     */
    sendToAllWindows({
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
        for (let win of this.windowsList) {
            win.instance.webContents.send(channel, ...props);
        }
        // send to main if needed
        if (includeMain === true && this.mainWindow !== null) {
            this.mainWindow.webContents.send(channel, ...props);
        }
    }
}

export let windowInstance: WindowInstance = new WindowInstance();

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