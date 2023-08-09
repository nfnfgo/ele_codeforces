// Fundamentals
import { useEffect, useState } from 'react';
import * as errs from 'general/error/base';

// Components
import { Center, Container, FlexDiv } from 'renderer/components/container';
import { CFTextIcon } from 'renderer/components/icons/codeforces';
import { Background } from 'renderer/components/general/background';
import { SelectionSettingTile, InputSettingTile, SettingTileLayout } from './setting_tile';
import { GoogleIcon } from 'renderer/components/icons/gicon';

// Tools
import { classNames } from 'renderer/tools/css_tools';
import { asyncSleep } from 'general/tools/async_sleep';
import { Link } from 'react-router-dom';
import { getLevelInfoByRatings, getLevelInfoByRatingsReturns } from 'general/tools/codeforce_levels';


// Stores
import { useAccountStore, useAccountStoreConfig, AccountData } from 'renderer/stores/accountStore';

// Models
import { logInCfAccountConfig } from 'main/api/cf/account';


/**
 * Account setting block
 */
export function AccountSettingBlock() {
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
            updateAccountStore(newAccData);

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
                defaultValue={account}
                onChanged={function (value) {
                    password = value;
                }} />
            {/* Login Button Part */}
            <button className={classNames(
                'flex flex-none min-w-0 w-full',
                'px-2 py-2',
                'flex-row justify-end items-center'
            )}
                onClick={handleLoginClick}>
                <Container
                    hasColor={false}
                    hasHoverColor={true}
                    className={classNames(
                        'transition-all',
                        'flex-none',
                        processLogin ? 'bg-primary/50 text-white/75' : 'bg-primary text-white',
                    )}>
                    <p className={classNames(
                        'mx-2 my-1'
                    )}>
                        {processLogin ? 'Login...' : 'Login'}
                    </p>
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
                        'w-full min-w-0 h-[10rem]',
                        'flex-row justify-center items-center',
                        'text-black/50 dark:text-white/50'
                    )}>
                        <p>No account has logged in</p>
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
                        <div className='relative rounded-xl shadow-xl overflow-hidden'>
                            <img src={accountData.avatarUrl as string}
                                className={classNames(
                                    'h-[10rem] w-[10rem]',
                                    'rounded-xl shadow-xl',
                                    'object-cover'
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
                            'flex-col px-2 gap-y-2'
                        )}>
                            <p className={classNames(
                                'font-bold text-lg'
                            )}>{accountData.handle}</p>
                            <p>{accountData.levelName}</p>
                            <p>{accountData.ratings}</p>
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
    return (
        <p>
            {JSON.stringify(ratingsInfo)}
        </p>
    );
}