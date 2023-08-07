/**
 * This file expose channels about opening specified page of this app
 * 
 * Generally, the chanel in this file shares the namespace `windowmgr:`
 */

import { ipcMain } from "electron";

import { openSettingsWindow } from './settings_window';
import { windowInstance } from './instance';

ipcMain.handle('windowmgr:open:settings', function () {
    return openSettingsWindow();
});

ipcMain.handle('windowmgr:signal:trigger:refresh', function () {
    windowInstance.sendToAllWindows({
        includeMain: true,
        channel: 'windowmgr:signal:refresh',
        props: [],
    });
});