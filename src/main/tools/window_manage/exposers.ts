/**
 * This file expose channels about opening specified page of this app
 * 
 * Generally, the chanel in this file shares the namespace `windowmgr:`
 */

import { ipcMain } from "electron";

import { openSettingsWindow } from './settings_window';

ipcMain.handle('windowmgr:open:settings', function () {
    return openSettingsWindow();
});