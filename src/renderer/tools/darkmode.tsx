

// Fundamentals
import { useLayoutEffect } from 'react';

/**
 * Returns the system default darkmode pref
 */
export function getSystemDarkmodePref(): boolean {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        console.log('Returning true');
        return true;
    }
    return false;
}

/**
 * Set the darkmode of current UI
 * 
 * Notice:
 * - If `darkmode` received `undefined`, then setting the darkmode 
 * based on system pref
 */
export function setUIDarkMode(darkmode: boolean | null) {
    if (darkmode === null) {
        darkmode = getSystemDarkmodePref();
    }
    if (darkmode === true) {
        document.documentElement.classList.add('dark');
    }
    else {
        document.documentElement.classList.remove('dark');
    }
}

/**
 * Update darkmode UI based on the info in the storage and the user system pref
 */
export async function updateDarkModeUIFromStorage() {
    let curDarkmode = await window.electron.ipcRenderer.invoke('storage:eleCfConfig:getInfo', 'theme.darkmode');
    if (curDarkmode === null) {
        curDarkmode = getSystemDarkmodePref();
    }
    if (curDarkmode === true) {
        document.documentElement.classList.add('dark');
    }
    else {
        document.documentElement.classList.remove('dark');
    }
}