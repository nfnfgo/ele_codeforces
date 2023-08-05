// Fundamental
import { BrowserWindow } from 'electron';

// Tools
import { openNewWindow } from 'main/tools/window_opener';

// config
import { windowInfo } from './configs';
const settingsWindowConfig = windowInfo.settings;

import { windowInstance, WindowManageInstanceData, WindowManageInstanceDataConfig } from './instance';

/**
 * Open app settings window
 * 
 * Notice:
 * - Name of settings window is `settings`
 * - If the window with name `settings` already in the instance list, 
 * this function will not open a new window, and only open the previous one
 */
export function openSettingsWindow() {
    // first check if has previous setting winodw
    let prevWindow = windowInstance.getNameWindow(settingsWindowConfig.name);
    // if window already exist
    if (prevWindow !== undefined) {
        prevWindow.instance.show();
        return;
    }
    // else, create new window
    let settingsWindow: BrowserWindow = openNewWindow({
        url: settingsWindowConfig.path,
        isFullUrl: false,
        show: true,
        onWindowClosed: function () {
            windowInstance.removeNameWindow(settingsWindowConfig.name);
        }
    });
    windowInstance.addNameWindow(settingsWindowConfig.name, settingsWindow);
}