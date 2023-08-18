import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';

// Tools
import { setDefault } from 'general/tools/set_default';

// Components
import { GoogleIcon } from 'renderer/components/icons/gicon';
import { classNames } from 'renderer/tools/css_tools';

interface ComboInputConfig<DataType> {
    /**The data used in this combo input component */
    data: DataType[];
    /**
     * Query filter function for autocomplete
     * 
     * Notice:
     * - This function get `queryString` which represent the user input, 
     * and `data` represent the data item currently checking
     * - This function should return `true` if `data` is 
     * consider relative to `queryString` and 
     * should appear in the hint list, otherwise, return `false`
     */
    queryFilter: (queryString: string, data: DataType) => (boolean);
    /**
     * Get title of a data item
     * 
     * This title would be showed to user as the item name and identifier
     */
    getDataTitle: (data: DataType) => (string);
    /**
     * Initial item of this combot input, this item could be NOT in 
     * the data list
     */
    initValue?: DataType;
    /**
     * Define the appear positon of the popup dropdown menu
     */
    vertical?: 'top' | 'bottom';
    /**
     * Define the horizonal align behaviour of the dropdown menu
     */
    horizonal?: 'left' | 'right';
    buttonColorClassName?: string;
    dropdownColorClassName?: string;
}

/**Input component with dropdown selection and autocomplete feature */
export function ComboInput<DataType>({
    data,
    queryFilter,
    initValue,
    getDataTitle,
    vertical,
    horizonal,
    buttonColorClassName,
    dropdownColorClassName,
}: ComboInputConfig<DataType>) {
    // set default
    initValue = setDefault(initValue, data[0]);
    queryFilter = setDefault(queryFilter, function () { return true; });
    vertical = setDefault(vertical, 'bottom');
    horizonal = setDefault(horizonal, 'right');

    const [selected, setSelected] = useState(initValue);
    const [query, setQuery] = useState('');

    // Filter result based on the received filter function
    const filteredData =
        query === ''
            ? data
            : data.filter(function (curData) {
                return queryFilter(query, curData);
            });

    //             (person) =>
    // (person.name as string)
    //     .toLowerCase()
    //     .replace(/\s+/g, '')
    //     .includes(query.toLowerCase().replace(/\s+/g, ''))

    return (
        <Combobox value={selected} onChange={setSelected}>
            <div className={classNames(
                'w-full',
                'overflow-visible',
                'relative',
            )}>
                <div className={classNames(
                    'relative w-full',
                    'cursor-default overflow-hidden',
                    'rounded-lg text-left',
                    'focus-visible:outline-none',
                )}>
                    <Combobox.Input
                        className={classNames(
                            'relative',
                            buttonColorClassName ?? 'bg-fgcolor dark:bg-fgcolor-dark',
                            'w-full border-none py-2 pl-3 pr-10',
                            'text-sm leading-5 text-gray-900 focus-visible:outline-none',
                        )}
                        displayValue={(data) => (getDataTitle(data as DataType))}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <GoogleIcon>expand_all</GoogleIcon>
                    </Combobox.Button>
                </div>
                <div className={classNames(
                    'absolute',
                    function () {
                        if (vertical === 'top') {
                            return 'mb-1 bottom-full';
                        }
                        return 'mt-1 top-0';
                    }(),
                    function () {
                        if (horizonal === 'right') {
                            return 'ml-0 left-0';
                        }
                        return 'mr-0 right-0';
                    }(),
                )}>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100 scale-75"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-75"
                        afterLeave={() => setQuery('')}
                    >
                        <Combobox.Options className={classNames(
                            'max-h-60 w-full',
                            'overflow-auto', 'rounded-md',
                            dropdownColorClassName ?? 'bg-fgcolor dark:bg-fgcolor-dark',
                            'py-1 shadow-lg',
                            'focus-visible:outline-none sm:text-sm',
                        )}>
                            {filteredData.length === 0 && query !== '' ? (
                                <div className={classNames(
                                    'relative cursor-default select-none',
                                    'py-2 px-4',
                                )}>
                                    Nothing found.
                                </div>
                            ) : (
                                filteredData.map((curData) => (
                                    <Combobox.Option
                                        key={getDataTitle(curData)}
                                        className={function ({ active }) {
                                            return classNames(
                                                'relative cursor-default select-none py-2 pl-10 pr-4',
                                                active ? 'bg-primary/50' : '',
                                            );
                                        }}
                                        value={curData}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span
                                                    className={`block truncate ${selected ? 'font-bold' : 'font-normal'
                                                        }`}
                                                >
                                                    {getDataTitle(curData)}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={classNames(
                                                            'absolute inset-y-0 left-0 flex items-center pl-3',
                                                        )}
                                                    >
                                                        <GoogleIcon>done</GoogleIcon>
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Combobox.Option>
                                ))
                            )}
                        </Combobox.Options>
                    </Transition>
                </div>
            </div>
        </Combobox >
    )
}
