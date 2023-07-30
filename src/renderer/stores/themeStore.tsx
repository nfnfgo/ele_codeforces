import { create } from 'zustand';


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
        this.darkMode = undefined;
    }

    /**
     * Store the darkmode status of the whole site. Could be null when initialized, 
     * null should be considered as follow the system settings
     */
    darkMode?: boolean = undefined;

    /**
     * Returns the darkmode that the app should be now based on the darkMode settings.
     * 
     * Returns:
     * - boolean: Returns `true` if the darkmode now need to be dark, else return `false`
     */

    getDarkModeNow(): boolean | undefined {
        if (this.darkMode === undefined) {
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

    toStorage(): ThemeData {
        window.localStorage.setItem('darkMode', `${this.darkMode}`);
        return this;
    }

    fromStorage(): ThemeData {
        if (typeof window === 'undefined') {
            console.log('[FailedToReadFromStorage] Can not update theme instance from ' +
                'storage since WebAPI is not accessable');
            return this;
        }
        let darkModeStr: string | null = window.localStorage.getItem('darkMode');
        let darkMode: boolean | null;
        if (darkModeStr !== null) {
            darkMode = JSON.parse(darkModeStr);
        }
        else {
            darkMode = null;
        }
        this.darkMode = darkMode;
        return this;
    }
}


export interface useThemeStoreStateConfig {
    theme: ThemeData,
    changeDarkMode: () => (void),
    setDarkMode: (mode: boolean | null) => (void),
}

const useThemeStore = create((set) => ({
    // Create the theme store based on the theme data from storage
    // This can promise the themedata is persistant when switching pages
    theme: new ThemeData().fromStorage(),
    changeDarkMode: () => set((state: useThemeStoreStateConfig) => {
        let oldThemeData: ThemeData = state.theme;
        // Copy a new data
        let newThemeData: ThemeData = new ThemeData().copyWith(oldThemeData);
        // Update the darkMode param in the new themedata
        // Notice: if this function has been called, that means the user has 
        // already change the darkmode manually, so the darkMode should no longer 
        // be null
        if (oldThemeData.darkMode === undefined) {
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
    setDarkMode: (mode?: boolean) => set((state: useThemeStoreStateConfig) => {
        let oldThemeData: ThemeData = state.theme;
        // Copy a new data
        let newThemeData: ThemeData = new ThemeData().copyWith(oldThemeData);
        newThemeData.darkMode = mode;
        newThemeData.toStorage();
        return {
            theme: newThemeData,
        }
    }),
}));

export { useThemeStore, ThemeData };