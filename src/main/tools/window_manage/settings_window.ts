// Fundamental
import { BrowserWindow } from 'electron';

// Tools
import { openNewWindow } from 'main/tools/window_opener';

import { windowInstance, WindowManageInstanceData, WindowManageInstanceDataConfig } from './instance';
import * as windowConfig from './configs';

/**
 * Open app settings window
 * 
 * Notice:
 * - Name of settings window is `settings`
 * - If the window with name `settings` already in the instance list, 
 * this function will not open a new window, and only open the previous one
 */
function openSettingsWindow() {
    // first check if has previous setting winodw
    let prevWindow = windowInstance.getNameWindow(windowConfig.windowName.settings);
    // if window already exist
    if (prevWindow !== undefined) {
        prevWindow.instance.show();
        return;
    }
    // else, create new window
    let settingsWindow: BrowserWindow = openNewWindow({
        url: '/settings',
        isFullUrl: false,
        show: true,
        onWindowClosed: function () {
            windowInstance.removeNameWindow(windowConfig.windowName.settings);
        }
    });
    windowInstance.addNameWindow(windowConfig.windowName.settings, settingsWindow);
}