import { create } from 'zustand';

// Error
import * as eleCfErr from 'general/error/base';


/** Check if the window (WebAPI) is accessable
 * 
 * Returns:
 * - `boolean`: Returns `true` if the window is accessable, else return `false`
 */
function windowAccessable(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }
    return true;
}


/** Check the user system darkmode pref settings.
 * 
 * Returns:
 * - `true` Darkmode enabled in user's divice
 * - `false` Darkmode disabled
 */
export function getSystemDarkmodePref(): boolean {
    if (windowAccessable() === false) {
        console.log(`[WindowUndefined] The window param is undefined when trying to get `
            + `the user dark mode preference`);
        return false;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
    }
    return false;
}

/**
 * Data class which stores the theme info
 */
class ThemeData {
    constructor() {
        this.darkMode = null;
    }

    /**
     * Store the darkmode status of the whole site. Could be null when initialized, 
     * null should be considered as follow the system settings
     */
    darkMode?: boolean | null = null;

    /**
     * Returns the darkmode that the app should be now based on the darkMode settings.
     * 
     * Returns:
     * - boolean: Returns `true` if the darkmode now need to be dark, else return `false`
     */

    getDarkModeNow(): boolean | undefined {
        if (this.darkMode === null) {
            return getSystemDarkmodePref();
        }
        else {
            return this.darkMode;
        }
    }

    /**
     * Update the field in this class instance based on another 
     * ThemeData instance
     * 
     * Returns:
     * - Return this instance itself after the copy
     */
    copyWith(ano: ThemeData): ThemeData {
        this.darkMode = ano.darkMode;
        return this;
    }

    async toStorage(): Promise<ThemeData> {
        try {
            await window.electron.ipcRenderer.invoke('storage:eleCfConfig:setInfo', 'theme.darkmode', this.darkMode);
            window.electron.ipcRenderer.invoke('windowmgr:signal:trigger:refresh');
        } catch (e) {
            throw new eleCfErr.EleCFError(
                'WriteStorageError',
                'Error occurred when try writing theme data thorugh IPC\n' +
                `Detail error message: ${e}`
            );
        }
        return this;
    }

    async fromStorage(): Promise<ThemeData> {
        let darkmodeInStorage: boolean | null = null;
        try {
            darkmodeInStorage = await window.electron.ipcRenderer.invoke('storage:eleCfConfig:getInfo', 'theme.darkmode');
        }
        catch (e) {
            throw new eleCfErr.EleCFError(
                'ReadStorageError',
                'Error occurred when try reading theme data thorugh IPC\n' +
                `Detail error message: ${e}`
            );
        }
        this.darkMode = darkmodeInStorage;
        return this;
    }
}


export interface useThemeStoreStateConfig {
    theme: ThemeData;
    changeDarkMode: () => (void);
    setDarkMode: (mode: boolean | null) => (void);
    updateDarkModeFromStorage: () => (void);
}

const useThemeStore = create(function (set) {
    let themeStoreInfo: useThemeStoreStateConfig = ({
        // Create the theme store based on the theme data from storage
        // This can promise the themedata is persistant when switching pages
        theme: new ThemeData(),
        changeDarkMode: () => set((state: useThemeStoreStateConfig) => {
            let oldThemeData: ThemeData = state.theme;
            // Copy a new data
            let newThemeData: ThemeData = new ThemeData().copyWith(oldThemeData);
            // Update the darkMode param in the new themedata
            // Notice: if this function has been called, that means the user has 
            // already change the darkmode manually, so the darkMode should no longer 
            // be null
            if (oldThemeData.darkMode === null) {
                oldThemeData.darkMode = getSystemDarkmodePref();
            }
            newThemeData.darkMode = !(oldThemeData.getDarkModeNow());
            // also need to update the localStorage
            newThemeData.toStorage();
            // Returns the new state
            return {
                theme: newThemeData,
            };
        }),
        setDarkMode: (mode: boolean | null) => set((state: useThemeStoreStateConfig) => {
            let oldThemeData: ThemeData = state.theme;
            // Copy a new data
            let newThemeData: ThemeData = new ThemeData().copyWith(oldThemeData);
            newThemeData.darkMode = mode;
            newThemeData.toStorage();
            return {
                theme: newThemeData,
            }
        }),
        updateDarkModeFromStorage: function () {
            window.electron.ipcRenderer.invoke('storage:eleCfConfig:getInfo', 'theme.darkmode').then(
                function (darkmode) {
                    set(function (state: useThemeStoreStateConfig) {
                        let newThemeData = new ThemeData().copyWith(state.theme);
                        newThemeData.darkMode = darkmode;
                        return { theme: newThemeData };
                    })
                }
            );
        }
    });
    // add ipcRenderer refresh listener
    window.electron.ipcRenderer.on('windowmgr:signal:refresh', function () {
        themeStoreInfo.updateDarkModeFromStorage();
    });
    return themeStoreInfo;
});

export { useThemeStore, ThemeData };