// Fundamental
import { useEffect, useLayoutEffect } from 'react';

// Tools
import { classNames } from 'renderer/tools/css_tools';

// Components
import { FlexDiv } from 'renderer/components/container';

// Stores
import { useThemeStore, useThemeStoreStateConfig } from 'renderer/stores/themeStore';

// Tools
import { setUIDarkMode } from 'renderer/tools/darkmode';

export interface BackgroundConfig {
    children: React.ReactNode;
    className?: string;
    /**
     * If this background should sized to full screen
     */
    fullScreen?: boolean;
}

/**
 * Background component that automatically set the background color 
 * and text color of it children based on the darkmode settings
 */
export function Background({
    children,
    className,
    fullScreen,
}: BackgroundConfig) {
    // set default 
    if (className === undefined) {
        className = '';
    }
    if (fullScreen === undefined) {
        fullScreen = true;
    }
    // use darkmode state
    const curDarkmode: boolean | undefined = useThemeStore(function (state) {
        return (state as useThemeStoreStateConfig).theme.darkMode;
    });
    let updateDarkmodeFromStorage = useThemeStore(function (state) {
        return (state as useThemeStoreStateConfig).updateDarkModeFromStorage;
    });
    // refresh when darkmode changed
    useEffect(function () {
        console.log('Background darkmode updated');
        setUIDarkMode(curDarkmode);
    }, [curDarkmode]);

    useEffect(function () {
        console.log('Updating darkmode from storage');
        updateDarkmodeFromStorage();
        // Refresh from the storage when receive a refresh signal from ipcMain
        window.electron.ipcRenderer.on('windowmgr:signal:refresh', function () {
            updateDarkmodeFromStorage();
        });
    }, []);

    return (<FlexDiv
        className={classNames(
            fullScreen ? 'flex-none w-screen h-screen' : '',
            'text-black dark:text-white',
            'bg-bgcolor dark:bg-bgcolor-dark',
            className,
        )}>
        {children}
    </FlexDiv>);
}