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
import { setDefault } from 'general/tools/set_default';


/**
 * Layout compoenent for setting tiles
 */
export function SettingTileLayout({
    left,
    right,
}: {
    left: React.ReactNode,
    right: React.ReactNode,
}) {
    return (<FlexDiv className={classNames(
        'flex-none w-full',
        'flex-row justify-between',
        'px-2 py-2',
    )}>
        <div className='flex flex-none justify-center items-center'>
            {left}
        </div>
        <div className='flex flex-none justify-center items-center'>
            {right}
        </div>
    </FlexDiv>);
}


export interface SelectionSettingTileConfig {
    /**Title of this selection setting tile */
    title: string;
    /**
     * Selections and it's corresponding value 
     * 
     * Notice:
     * - `value` is used for callback function when user selected a 
     * specified value
     */
    selections: { name: string, value: any }[];
    /**
     * Default selection when initializing, if `undefined`, use the first value 
     * in the selections
     *  */
    defaultValue?: any;
    /**Callback function when specified value selected */
    onSelectValue: (value: any) => (any);
}

/**
 * Setting tile compoent allows user to choose setting over few selection
 * 
 * E.g.: Select `modeA`, `modeB` or `modeC`
 */
export function SelectionSettingTile({
    title,
    selections,
    defaultValue,
    onSelectValue,
}: SelectionSettingTileConfig) {
    // set default 
    if (defaultValue === undefined) {
        defaultValue = selections[0].value;
    }

    const [selectedValue, setSelectedValue] = useState(defaultValue);

    return (
        <SettingTileLayout
            left={(<p>{title}</p>)}
            right={(
                <>
                    <FlexDiv className={classNames(
                        'flex-row'
                    )}>
                        {selections.map(
                            function (selection) {
                                let selected = selection.value === selectedValue;
                                return (<>
                                    <button key={selection.name}
                                        onClick={function () {
                                            // update ui
                                            setSelectedValue(selection.value);
                                            // trigger callback
                                            onSelectValue(selection.value);
                                        }}
                                        className='ml-1'>
                                        <Container
                                            hasColor={false}
                                            hasHoverColor={selected ? false : true}
                                            className={classNames(
                                                'transition-colors',
                                                selected ? 'bg-black dark:bg-white' : '',
                                                selected ? 'text-white dark:text-black' : '',
                                            )}>
                                            <Center className={classNames(
                                                'mx-1 my-1',
                                            )}>
                                                {selection.name}
                                            </Center>
                                        </Container>
                                    </button>
                                </>);
                            }
                        )}
                    </FlexDiv>
                </>
            )}
        />);
}


export interface InputSettingTileConfig {
    /**Title of this setting tile */
    title: string;
    /**
     * Type of the input field
     * 
     * Must be a valid type for standard HTML `<input>` tag
     */
    type?: string;
    /**Default value of this string */
    defaultValue?: string;
    /**
     * Callback function when value of the input changed
     */
    onChanged?: (value: string) => (any);
}

export function InputSettingTile({
    title,
    defaultValue,
    type,
    onChanged,
}: InputSettingTileConfig) {
    // set default
    defaultValue = setDefault(defaultValue, '');
    onChanged = setDefault(onChanged, function (value) { });
    type = setDefault(type, 'text');

    return (
        <SettingTileLayout
            left={(<p>{title}</p>)}
            right={(
                <input
                    type={type}
                    placeholder={defaultValue}
                    onChange={function (e) {
                        onChanged!(e.target.value);
                    }}
                    className={classNames(
                        'rounded-lg',
                        'px-2 py-1',
                        'bg-black/5 dark:bg-white/10',
                        'focus-visible:outline-none',
                        'focus-visible:shadow-lg focus-visible:shadow-black/20 transition-shadow'
                    )}></input>
            )}
        />
    );
}