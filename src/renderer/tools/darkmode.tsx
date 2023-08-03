

// Fundamentals
import { useLayoutEffect } from 'react';

export function getSystemDarkmodePref(): boolean {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        console.log('Returning true');
        return true;
    }
    return false;
}


/**
 * Update darkmode UI based on the info in the storage and the user system pref
 */
export async function updateDarkModeUIFromStorage() {
    let curDarkmode = await window.electron.ipcRenderer.invoke('storage:eleCfConfig:getInfo', 'theme.darkmode');
    if (curDarkmode === undefined) {
        curDarkmode = getSystemDarkmodePref();
    }
    if (curDarkmode === true) {
        document.documentElement.classList.add('dark');
    }
    else {
        document.documentElement.classList.remove('dark');
    }
}