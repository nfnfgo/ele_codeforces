import { create } from 'zustand';

// Middleware
import { immer as immerMiddleware } from 'zustand/middleware/immer';

import { immerable, produce } from 'immer';

// Error
import * as eleCfErr from 'general/error/base';

/**
 * Data class for codeforces account info
 */
export class AccountData {
    // Support immer middleware
    [immerable] = true;

    constructor(account?: string | null, password?: string | null) {
        if (account === undefined) {
            account = null;
        }
        if (password === undefined) {
            password = null;
        }
        this.account = account;
        this.password = password;
        this.handle = null;
        this.ratings = null;
        this.levelName = null;
        this.avatarUrl = null;
    }
    /**Account login context of a user, could be handle or email */
    account: string | null;
    /**Password of this account */
    password: string | null;
    /**
     * CF Handle of this user
     * 
     * Notice:
     * - If this field is `null`, then the user is considered NOT loged in. 
     * This field should not be changed by user and should only set a valid 
     * value after verifying the account and password
     */
    handle: string | null;
    /**CF rating of this user */
    ratings: number | null;
    /**Level name of this account, e.g.:`newbie` */
    levelName: string | null;
    /**URL address of user pic info, e.g.:`https://userpic.codeforces.org/xxx/title/xxx.jpg` */
    avatarUrl: string | null;

    // updateWith(anoIns: AccountData): AccountData {
    //     this.account = anoIns.account;
    //     this.password = anoIns.password;
    //     this.handle = anoIns.handle;
    //     this.ratings = anoIns.ratings;
    //     this.levelName = anoIns.levelName;
    //     this.avatarUrl = anoIns.avatarUrl;
    //     return this;
    // }

    // static copyWith(anoIns: AccountData): AccountData {
    //     return new AccountData(anoIns.account, anoIns.password).updateWith(anoIns);
    // }

    async toStorage(): Promise<AccountData> {
        try {
            // Update info
            await window.electron.ipcRenderer.invoke(
                'storage:eleCfConfig:setInfo',
                'accountInfo',
                JSON.parse(JSON.stringify(this)));
            // Notify other window
            window.electron.ipcRenderer.invoke('windowmgr:signal:trigger:refresh');
            return this;
        } catch (e) {
            throw new eleCfErr.EleCFError(
                'WriteStorageError',
                'Error occurred when tring to write account info into storage\n' +
                `Detail error message: ${e}`

            );
        }
    }

    /**
     * Update account info from another property with the same field
     */
    fromProps(props: any) {
        try {
            this.account = props.account ?? null;
            this.password = props.password ?? null;
            this.handle = props.handle ?? null;
            this.ratings = props.ratings ?? null;
            this.levelName = props.levelName ?? null;
            this.avatarUrl = props.avatarUrl ?? null;
        } catch (e) {
            ;
        }
    }
}

export interface useAccountStoreConfig {
    /**`AccountData` instance which stores user's account data */
    accountData: AccountData;
    /**
     * Upate the current account data store info
     * 
     * Params:
     * - `mutateFn` Function that received a current state draft, and directly 
     * make changes on this draft, which will be later be sync to the real state
     */
    updateAccountData: (mutateFn: (draft: useAccountStoreConfig) => (any)) => void;
    /**
     * Automatically read the data from storage package and update current state
     */
    updateAccountDataFromStorage: () => Promise<void>;
}


/**
 * Store provide some codeforces account info and data
 */
export const useAccountStore = create(immerMiddleware<useAccountStoreConfig>(
    function (set, get) {
        let storeInfo: useAccountStoreConfig = {
            accountData: new AccountData(),
            updateAccountData(mutateFn) {
                set(function (state) {
                    mutateFn(state);
                });
            },
            async updateAccountDataFromStorage() {
                try {
                    let jsonInfo = await window.electron.ipcRenderer.invoke('storage:eleCfConfig:getInfo', 'accountInfo');
                    set(function (state) {
                        state.accountData.fromProps(jsonInfo);
                    });
                } catch (e) {
                    throw new eleCfErr.EleCFError(
                        'ReadStorageError',
                        'Error occurred when reading account info from the storage\n' +
                        `Detail error message: ${e}`
                    );
                }
            }
        }
        // add ipcRenderer refresh listener
        window.electron.ipcRenderer.on('windowmgr:signal:refresh', function () {
            storeInfo.updateAccountDataFromStorage();
        });
        return storeInfo;
    })
);