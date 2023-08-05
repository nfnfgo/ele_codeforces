/**
 * This module provide a method to open window in main process with 
 * standard window open handler
 * 
 * To enable compelete functionality, you may need to call `exposeOpenerToIpcMain` 
 * to expose the window open function to ipc channel
 */


import { BrowserWindow, ipcMain } from 'electron';
import { app } from 'electron';
import path from 'path';

// Utils
import { resolveHtmlPath } from 'main/util';

export interface openNewWindowConfig {
    url: string;
    /**
     * If url param passed is a full url
     */
    isFullUrl?: boolean;
    /**
     * Show the browerwindow after creating it
     * 
     * If you need to operate on the new window before it shows, 
     * you can set this param to `false`
     */
    show?: boolean;
    /**
     * Function called when this window is about to close
     * 
     * Usually, you need to remove all reference of this window to 
     * avoid using it again
     */
    onWindowClosed?: () => (any);
}

/**
 * Open a new window in the main process with specified url and config
 */
export function openNewWindow({
    url,
    isFullUrl,
    show,
    onWindowClosed,
}: openNewWindowConfig): BrowserWindow {
    if (isFullUrl === undefined) {
        isFullUrl = false;
    }
    if (show === undefined) {
        show = true;
    }
    if (onWindowClosed === undefined) {
        onWindowClosed = () => (undefined);
    }
    const RESOURCES_PATH = app.isPackaged
        ? path.join(process.resourcesPath, '../assets')
        : path.join(__dirname, '../../../assets');

    const getAssetPath = (...paths: string[]): string => {
        return path.join(RESOURCES_PATH, ...paths);
    };

    let newWindow = new BrowserWindow({
        show: false,
        width: 1024,
        height: 728,
        icon: getAssetPath('icon.png'),
        webPreferences: {
            preload: app.isPackaged
                ? path.join(__dirname, '../main/preload.js')
                : path.join(__dirname, '../../../.erb/dll/preload.js'),
        },
    });

    if (isFullUrl) {
        newWindow.loadURL(url);
    }
    else {
        newWindow.loadURL(resolveHtmlPath(`${url}`));
    }

    newWindow.on('ready-to-show', () => {
        if (!newWindow) {
            throw new Error('"newWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            newWindow.minimize();
        } else if (show === true) {
            newWindow.show();
        }
    });

    newWindow.on('closed', () => {
        newWindow = null;
        onWindowClosed();
    });

    newWindow.webContents.setWindowOpenHandler(generalWindowOpenHandler);

    return newWindow;
}

/**
 * Expose an channel to IPC, if this function wall called, ipcRenderer could send message to 
 * open a new window
 * 
 * Params:
 * - `channelName` (Optional) Name of  the exposed channel, default to `windowopt:open`
 * 
 * Notice:
 * - The ipcMain receive params will be sync with the params of function `openNewWindow()` 
 * in `./src/main/tools/window_opener`
 */
export function exposeOpenerToIpcMain(channelName?: string): void {
    if (channelName === undefined) {
        channelName = 'windowopt:open';
    }
    ipcMain.handle(channelName, function (event, prop) {
        try {
            openNewWindow(prop);
            return true;
        } catch (e) {
            return false;
        }
    });
}

/**
 * General window open handler for this app
 * 
 * Usually used with `[Instance of BrowserWindow].webContents.setWindowOpenHandler()`
 */
export function generalWindowOpenHandler(handleDetail: Electron.HandlerDetails): { action: 'deny' } {
    openNewWindow({
        url: handleDetail.url,
        isFullUrl: true,
        show: true,
    });
    return {
        action: 'deny',
    };
}