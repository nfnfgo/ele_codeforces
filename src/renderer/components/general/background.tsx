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
    const curDarkmode: boolean | null = useThemeStore(function (state) {
        return (state as useThemeStoreStateConfig).theme.darkMode as (boolean | null);
    });

    // Expose method to refresh darkmode from storage
    let updateDarkmodeFromStorage = useThemeStore(function (state) {
        return (state as useThemeStoreStateConfig).updateDarkModeFromStorage;
    });

    // refresh when darkmode changed
    useEffect(function () {
        setUIDarkMode(curDarkmode);
    }, [curDarkmode]);

    // Update darkmode from storage when component first created
    useEffect(function () {
        updateDarkmodeFromStorage();
    }, []);

    return (<FlexDiv
        className={classNames(
            fullScreen ? 'flex-none w-screen h-screen' : '',
            'text-black dark:text-white',
            'bg-bgcolor dark:bg-bgcolor-dark',
            'select-none',
            className,
        )}>
        {children}
    </FlexDiv>);
}