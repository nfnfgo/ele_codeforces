// Fundamentals
import { CSSProperties, useEffect, useState } from 'react';
import * as errs from 'general/error/base';

// Components
import { Center, Container, FlexDiv } from 'renderer/components/container';
import { CFTextIcon } from 'renderer/components/icons/codeforces';
import { Background } from 'renderer/components/general/background';
import { SelectionSettingTile, InputSettingTile, SettingTileLayout } from './setting_tile';
import { GoogleIcon } from 'renderer/components/icons/gicon';
import { Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Tools
import { classNames } from 'renderer/tools/css_tools';
import { asyncSleep } from 'general/tools/async_sleep';
import { Link } from 'react-router-dom';
import { LevelInfo, getLevelInfoByRatings, getLevelInfoByRatingsReturns } from 'general/tools/codeforce_levels';


// Stores
import { useAccountStore, useAccountStoreConfig, AccountData } from 'renderer/stores/accountStore';

// Models
import { logInCfAccountConfig } from 'general/models/cf/account';


/**
 * Account setting block
 */
export function AccountSettingBlock() {
    let updateAccountDataFromStorage = useAccountStore(function (state: useAccountStoreConfig) {
        return state.updateAccountDataFromStorage;
    });

    useEffect(function () {
        updateAccountDataFromStorage();
    }, []);

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
                <AccountInfoBlock></AccountInfoBlock>
                <AccountLoginTile></AccountLoginTile>
            </FlexDiv>
        </FlexDiv>
    );
}

/**
 * Account login component
 */
function AccountLoginTile() {
    let account: string = '';
    let password: string = '';

    const [processLogin, setProcessLogin] = useState<boolean>(false);
    const [processFailed, setProcessFailed] = useState<boolean>(false);

    let updateAccountStore = useAccountStore(function (state: useAccountStoreConfig) {
        return state.updateAccountData;
    });
    let accountData = useAccountStore(function (state: useAccountStoreConfig) {
        return state.accountData;
    });

    account = accountData.account ?? '';
    password = accountData.password ?? '';


    /**
     * Handle login process when user click Login button
     */
    async function handleLoginClick() {
        setProcessLogin(true);
        try {
            let loginParams: logInCfAccountConfig = {
                account: account,
                password: password,
                triggerRefresh: false,
                updateStorage: false,
            };
            let resData: AccountData = await window.electron.ipcRenderer.invoke(
                'api:cf:logInCfAccount',
                loginParams,
            )
            // Check handle
            if (resData.handle === undefined) {
                throw new errs.EleCFError(
                    'HandleUndefined',
                    'Got an undefined handle from login result'
                );
            }
            // update store
            // create new accountdata
            let newAccData = new AccountData(resData.account, resData.password);
            newAccData.handle = resData.handle;
            newAccData.ratings = resData.ratings;
            newAccData.levelName = resData.levelName;
            newAccData.avatarUrl = resData.avatarUrl;
            updateAccountStore(function (state) {
                state.accountData = newAccData;
            });

            setProcessFailed(false);
        }
        catch (e) {
            setProcessFailed(true);
        }
        finally {
            setProcessLogin(false);
        }
    }

    return (
        <>
            <InputSettingTile
                title='Account'
                type='text'
                defaultValue={account}
                onChanged={function (value) {
                    account = value;
                }} />
            <InputSettingTile
                title='Password'
                type='password'
                defaultValue={password}
                onChanged={function (value) {
                    password = value;
                }} />
            {/* Login Button Part */}
            <button className={classNames(
                'flex flex-none min-w-0 w-full',
                'px-2 py-2',
                'flex-row justify-end items-center'
            )}
                onClick={function () {
                    if (processLogin === false) {
                        handleLoginClick();
                    }
                }}>
                <Container
                    hasColor={false}
                    hasHoverColor={true}
                    className={classNames(
                        'transition-all',
                        'flex-none',
                        processLogin ? 'bg-primary/50 text-white/75' : 'bg-primary text-white',
                    )}>
                    <FlexDiv className={classNames(
                        'flex-row justify-center items-center',
                    )}>
                        <FlexDiv className={classNames(
                            'flex-row justify-center items-center',
                            processLogin ? 'h-[2rem] w-[2rem]' : 'h-[2rem] w-0',
                            processLogin ? 'animate-spin' : '',
                            processLogin ? 'opacity-100' : 'opacity-0',
                            'origin-center transition-all ease-out',
                        )}>
                            <GoogleIcon className={classNames(
                                'overflow-hidden',
                            )}>
                                progress_activity
                            </GoogleIcon>
                        </FlexDiv>
                        <p className={classNames(
                            'transition-all ease-out',
                            processLogin ? 'mr-2 ml-0' : 'mx-4 my-1',
                        )}>
                            Login
                        </p>
                    </FlexDiv>
                </Container>
            </button>
            {/* Login Failed Tips Part */}
            <FlexDiv
                className={classNames(
                    'flex-row justify-end items-center',
                    'w-full min-w-0',
                    'px-2',
                )}>
                <p className={classNames(
                    'text-red dark:text-red-light',
                    processFailed ? '' : 'hidden',
                )}>Login failed, please check your account and password</p>
            </FlexDiv>
        </>
    );
}

/**
 * Block component used to show account info and login status
 */
function AccountInfoBlock() {

    let accountData = useAccountStore(function (state: useAccountStoreConfig) {
        return state.accountData;
    });

    return (
        function () {
            // if not logged in
            if (accountData === undefined || accountData.handle === null) {
                return (
                    <FlexDiv className={classNames(
                        'group/no-account-login',
                        'w-full min-w-0 h-[10rem]',
                        'justify-center items-center',
                        'text-black/50 dark:text-white/50',
                        'flex-col gap-y-2',
                        'rounded-lg hover:bg-black/5 dark:hover:bg-white/5',
                    )}>
                        <p className={classNames(
                            'group-hover/no-account-login:font-bold transition-all',
                        )}>No account has logged in</p>
                        <p className={classNames(
                            'h-0 group-hover/no-account-login:h-[3rem]',
                            'opacity-0 group-hover/no-account-login:opacity-100',
                            'transition-all',
                        )}>Login to check your account info and submit answers</p>
                    </FlexDiv>);
            }
            // if logged in
            return (
                <FlexDiv className={classNames(
                    'w-full',
                    'flex-col gap-y-2',
                )}>
                    <p className='px-2'>Account Info</p>
                    <FlexDiv className={classNames(
                    )}>
                        {/* Account Avatar Photo */}
                        <div className={classNames(
                            'group/avatar',
                            'flex flex-none',
                            'h-[10rem] w-[10rem]',
                            'relative rounded-xl shadow-xl overflow-hidden',
                        )}>
                            <img src={accountData.avatarUrl as string}
                                className={classNames(
                                    'flex-none',
                                    'h-full w-full',
                                    'rounded-xl shadow-xl',
                                    'object-cover',
                                    'group-hover/avatar:scale-110',
                                    'transition-all duration-[1.2s] ease-out',
                                )}></img>
                            <FlexDiv
                                className={classNames(
                                    'absolute bottom-0',
                                    'w-full min-w-0',
                                    'flex-row justify-center items-center',
                                    'px-3 py-1',
                                    'backdrop-blur-md',
                                    'rounded-b-xl',
                                    'bg-white/70 dark:bg-black/60'
                                )}>
                                <p>{accountData.handle}</p>
                            </FlexDiv>
                        </div>
                        {/* Account Detailed Info */}
                        <FlexDiv className={classNames(
                            'w-full',
                            'flex-col px-2 gap-y-2'
                        )}>
                            <p className={classNames(
                                'font-bold text-lg'
                            )}>{accountData.handle}</p>
                            <RatingInfoCard accountData={accountData} />
                        </FlexDiv>
                    </FlexDiv>
                </FlexDiv>)
        }()
    );
}

/**
 * Card component shows user's ratings relavant info
 * 
 * Usually used in `AccountInfoBlock`
 */
function RatingInfoCard({ accountData }: { accountData: AccountData }) {
    let ratings: number = accountData.ratings as number;
    let ratingsInfo: getLevelInfoByRatingsReturns = getLevelInfoByRatings(ratings);
    let persent: number =
        (ratings - ratingsInfo.current.lowestRatings) /
        (ratingsInfo.current.highestRatings - ratingsInfo.current.lowestRatings);
    return (
        <FlexDiv
            className={classNames(
                'flex-col gap-y-2',
            )}
            style={{
                '--cf-level-color': ratingsInfo.current.color,
                '--cf-level-color-prev': ratingsInfo.previous?.color ?? ratingsInfo.current.color,
                '--cf-level-color-next': ratingsInfo.next?.color ?? ratingsInfo.current.color,
                '--cf-persentage': `${persent * 100}%`
            } as CSSProperties}>
            {/* Detailed Level Ratings Info */}
            <FlexDiv>
                {/* LevelName Info */}
                <Container hasColor={false}
                    className={classNames(
                        'relative',
                        'w-full min-w-0',
                    )}>
                    <FlexDiv className={classNames(
                        'w-full',
                        'flex-row justify-center',
                    )}>
                        {/* Prev Level Name */}
                        <FlexDiv className={classNames(
                            'flex-none'
                        )}>
                            <LevelInfoBlock
                                levelInfo={ratingsInfo.previous}
                                currentLevelInfo={ratingsInfo.current} />
                        </FlexDiv>
                        {/* Current Level Name */}
                        <FlexDiv className={classNames(
                            'flex-auto w-full',
                        )}>
                            <Container hasColor={false}
                                hasShadow={false}
                                className={classNames(
                                    'min-w-fit w-[--cf-persentage]',
                                )}>
                                <div className={classNames(
                                    'flex flex-auto w-full',
                                    'flex-row justify-end items-center px-2',
                                )}>
                                    <FlexDiv className={classNames(
                                        'flex-col justify-center'
                                    )}>
                                        <p className={classNames(
                                            'text-[--cf-level-color] text-center'
                                        )}>{ratingsInfo.current.levelName}</p>
                                        <p className={classNames(
                                            'text-[--cf-level-color] text-center',
                                        )}>{accountData.ratings}</p>
                                    </FlexDiv>
                                </div>
                            </Container>
                        </FlexDiv>
                        {/* Next Level Name */}
                        <FlexDiv className={classNames(
                            'flex-none'
                        )}>
                            <LevelInfoBlock
                                levelInfo={ratingsInfo.next}
                                currentLevelInfo={ratingsInfo.current} />
                        </FlexDiv>
                    </FlexDiv>
                </Container >

            </FlexDiv>
            {/* Progress Bar */}
            <Container hasColor={false}
                className={classNames(
                    'w-full min-w-0',
                    'bg-black/10 dark:bg-white/10',
                )}>
                <Container hasColor={false}
                    hasShadow={false}
                    className={classNames(
                        'bg-[--cf-level-color] text-white',
                        'min-w-fit w-[--cf-persentage]',
                    )}>
                    <div className={classNames(
                        'flex flex-auto w-full',
                        'flex-row justify-end items-center px-2',
                    )}>
                        {`${persent * 100}`.substring(0, 5)}%
                    </div>
                </Container>
            </Container >
        </FlexDiv>
    );
}

/**
 * Show the info of a specified level
 * 
 * Usually used in RatingInfoBlock
 */
function LevelInfoBlock({
    levelInfo,
    currentLevelInfo,
}: {
    levelInfo?: LevelInfo,
    currentLevelInfo: LevelInfo,
}) {
    let color = levelInfo?.color ?? currentLevelInfo.color;

    // Store hover state of this level info
    const [isHovered, setIsHovered] = useState(false);

    // check if this level is previous level or after level
    let isPrev: boolean = false;
    if (levelInfo === undefined) {
        if (currentLevelInfo.lowestRatings !== 0) {
            isPrev = false;
        }
        else {
            isPrev = true;
        }
    }
    else {
        if (levelInfo.lowestRatings > currentLevelInfo.lowestRatings) {
            isPrev = false;
        }
        else {
            isPrev = true;
        }
    }

    /**Handle the hover state of thsi level block */
    function handleHoverStateChange(isHovered: boolean) {
        // console.log(`Handle level info block hover change: ${isHovered}`);
        setIsHovered(isHovered);
    }

    return (
        // Level Info Root Part
        <FlexDiv className={classNames(
            'flex-auto flex-col justify-center',
            'bg-[--level-block-color] text-white',
            'rounded-lg px-2 py-1',
            'group/little-level-block'
        )}
            style={{
                '--level-block-color': color,
            } as CSSProperties}
            onHoverStateChange={handleHoverStateChange}>
            <p className={classNames(
                'text-white text-center'
            )}>{levelInfo?.levelName ?? '-'}</p>
            <p className={classNames(
                'text-white text-center',
            )}>{function () {
                if (isPrev) {
                    return levelInfo?.highestRatings ?? '0';
                }
                return levelInfo?.lowestRatings ?? '-';
            }() ?? '0'}</p>
            {/* <div className={classNames(
                'overflow-hidden',
                'flex flex-row justify-center items-center',
                'opacity-0 group-hover/little-level-block:opacity-100',
                'max-w-0 group-hover/little-level-block:max-w-[15rem]',
                'max-h-0 group-hover/little-level-block:max-h-[3rem]',
                'transition-all ease-linear duration-[0.2s]',
                'whitespace-nowrap',
            )}>
                <FlexDiv className={classNames(
                    'flex-col gap-x-3',
                )}>
                    <div className={classNames(
                        'h-[1px] bg-white/50',
                    )}></div>
                    {function () {
                        if (levelInfo === undefined) {
                            return (<p>No level info</p>)
                        }
                        return (
                            <p>{levelInfo?.lowestRatings ?? '-'} ~ {levelInfo?.highestRatings ?? '-'}</p>
                        );
                    }()}
                </FlexDiv>
            </div> */}
            <Transition
                as={Fragment}
                show={isHovered}

                enter='transition-all ease-out'
                enterFrom='opacity-0 max-w-0 max-h-0'
                enterTo='opacity-100 max-w-[15rem] max-h-[3rem]'

                leave='transition-all ease-out'
                leaveFrom='opacity-100 max-w-[15rem] max-h-[3rem]'
                leaveTo='opacity-0 max-w-0 max-h-0'>
                <div className={classNames(
                    'overflow-hidden',
                    'flex flex-row justify-center items-center',
                    'transition-all ease-linear duration-[0.2s]',
                    'whitespace-nowrap',
                )}>
                    <FlexDiv className={classNames(
                        'flex-col gap-x-3',
                    )}>
                        <div className={classNames(
                            'h-[1px] bg-white/50',
                        )}></div>
                        {function () {
                            if (levelInfo === undefined) {
                                return (<p>No level info</p>)
                            }
                            return (
                                <p>{levelInfo?.lowestRatings ?? '-'} ~ {levelInfo?.highestRatings ?? '-'}</p>
                            );
                        }()}
                    </FlexDiv>
                </div>
            </Transition>
        </FlexDiv>);
}