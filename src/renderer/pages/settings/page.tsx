// Fundamentals
import { useEffect, useState } from 'react';

// Components
import { Center, Container, FlexDiv } from 'renderer/components/container';
import { CFTextIcon } from 'renderer/components/icons/codeforces';
import { Background } from 'renderer/components/general/background';

// Tools
import { classNames } from 'renderer/tools/css_tools';
import { Link } from 'react-router-dom';
import { GoogleIcon } from 'renderer/components/icons/gicon';

// Datas
import { settingCategoryList } from './settings_data';

// Settings Blocks
import { AppearanceSettingBlock } from './appearance_settings';
import { AccountSettingBlock } from './account_settings';
import { GeneralSettingsBlock } from './general_settings';

const settingsBlockMap = {
    'Appearance': <AppearanceSettingBlock></AppearanceSettingBlock>,
    'General': <GeneralSettingsBlock></GeneralSettingsBlock>,
    'Account': <AccountSettingBlock></AccountSettingBlock>,
};

/**
 * Settings Page
 */
export function SettingsPage() {

    const [selectedSettingsCategory, setSelectedSettingsCategory] = useState<string>(settingCategoryList[0].title);

    return (
        <Background>
            <div className={classNames(
                'flex flex-none',
                'min-h-0 min-w-0',
            )}>
                {/* Settings Category Choose */}
                <FlexDiv expand={false} className={classNames(
                    'min-w-[15rem] min-h-0',
                    'overflow-y-auto',
                )}>
                    <FlexDiv
                        clearMinLimit={true}
                        expand={true}
                        className={classNames(
                            'flex-col gap-y-3',
                            'justify-start items-start',
                            'mx-3 my-3',
                        )}>
                        {settingCategoryList.map(function (data) {
                            return (<SettingsCategoryTitle
                                iconName={data.iconName}
                                title={data.title}
                                onClick={function (title) {
                                    setSelectedSettingsCategory(title);
                                }}
                                selected={data.title === selectedSettingsCategory} />);
                        })}
                    </FlexDiv>
                </FlexDiv>
                {/* Setting Block Part */}
                <FlexDiv
                    expand={true}
                    className={classNames(
                        'flex-auto',
                        'px-3 py-3'
                    )}>
                    <Container
                        expand={true}>
                        {function () {
                            let block = settingsBlockMap[selectedSettingsCategory];
                            if (block === undefined) {
                                return (<Center><p>Undefined Settings</p></Center>);
                            }
                            return block;
                        }()}
                    </Container>
                </FlexDiv>
            </div>
        </Background >
    );
}

interface SettingsCategoryTitleConfig {
    iconName: string;
    title: string;
    selected?: boolean;
    /**
     * Callback function when this category title was clicked
     * 
     * Callback function could receive `title` param represent 
     * the title of this category title
     */
    onClick?: (title: string) => (any);
}

/**
 * Title component of a setting category
 */
function SettingsCategoryTitle({
    iconName,
    title,
    selected,
    onClick,
}: SettingsCategoryTitleConfig) {
    // set default 
    if (selected === undefined) {
        selected = false;
    }
    if (onClick === undefined) {
        onClick = function () { return undefined; };
    }
    return (<>
        <button
            className='w-full'
            onMouseDown={function () {
                console.log('md');
                onClick!(title);
            }}
            onClick={function () {
                console.log('onclick');
                onClick!(title);
            }}>
            <Container
                className={classNames(
                    'flex-row justify-start items-center',
                )}
                selected={selected}
                hasHoverColor={true}>
                {/* Icon Part */}
                <div className={classNames(
                    'flex flex-row justify-start items-start',
                    'mx-4 my-2',
                )}>
                    <Center>
                        <GoogleIcon className='mr-4'>
                            {iconName}
                        </GoogleIcon>
                    </Center>
                    <p className={classNames(
                        'text-center text-lg',
                    )}>{title}</p>
                </div>
            </Container>
        </button>
    </>);
}