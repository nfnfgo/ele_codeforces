// Fundamentals
import { useEffect, useState } from 'react';

// Components
import { Center, Container, FlexDiv } from 'renderer/components/container';
import { CFTextIcon } from 'renderer/components/icons/codeforces';
import { Background } from 'renderer/components/general/background';
import { SelectionSettingTile } from './setting_tile';
import { GoogleIcon } from 'renderer/components/icons/gicon';

// Tools
import { classNames } from 'renderer/tools/css_tools';
import { Link } from 'react-router-dom';


// Stores
import { useThemeStore, useThemeStoreStateConfig } from 'renderer/stores/themeStore';

export function AppearanceSettingBlock() {
    let curDarkmode = useThemeStore(function (state: useThemeStoreStateConfig) {
        return state.theme.darkMode;
    });
    let setDarkModeStore = useThemeStore(function (state: useThemeStoreStateConfig) {
        return state.setDarkMode;
    });

    return (
        <FlexDiv
            expand={true}
            className={classNames(
                'overflow-y-auto',
            )}>
            <FlexDiv className={classNames(
                'my-2 mx-2',
                'w-full',
                'flex-col gap-y-2 justify-start items-start',
            )}>
                <SelectionSettingTile
                    title='DarkMode'
                    defaultValue={curDarkmode}
                    selections={
                        [
                            {
                                name: 'Light',
                                value: false,
                            },
                            {
                                name: 'Dark',
                                value: true,
                            },
                            {
                                name: 'System',
                                value: null,
                            }
                        ]
                    }
                onSelectValue={function (value) {
                    setDarkModeStore(value);
                }} />
            </FlexDiv>
        </FlexDiv>);
}