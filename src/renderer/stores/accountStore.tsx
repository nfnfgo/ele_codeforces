import { create } from 'zustand';

// Error
import * as eleCfErr from 'general/error/base';

/**
 * Data class for codeforces account info
 */
export class AccountData {
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

    updateWith(anoIns: AccountData): AccountData {
        this.account = anoIns.account;
        this.password = anoIns.password;
        this.handle = anoIns.handle;
        this.ratings = anoIns.ratings;
        this.levelName = anoIns.levelName;
        this.avatarUrl = anoIns.avatarUrl;
        return this;
    }

    static copyWith(anoIns: AccountData): AccountData {
        return new AccountData(anoIns.account, anoIns.password).updateWith(anoIns);
    }

    async toStorage(): Promise<AccountData> {
        try {// Update info
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
                `Detail error message: ${e}` + 6

            );
        }
    }

    async fromStorage(): Promise<AccountData> {
        try {
            let jsonInfo = await window.electron.ipcRenderer.invoke('storage:eleCfConfig:getInfo', 'accountInfo');
            this.account = jsonInfo.account;
            this.password = jsonInfo.password;
            this.handle = jsonInfo.handle;
            this.ratings = jsonInfo.ratings;
            this.levelName = jsonInfo.levelName;
            this.avatarUrl = jsonInfo.avatarUrl;
            return this;
        } catch (e) {
            throw new eleCfErr.EleCFError(
                'ReadStorageError',
                'Error occurred when reading account info from the storage\n' +
                `Detail error message: ${e}`
            );
        }
    }

    fromProps(props: any) {
        ;
    }
}

export interface useAccountStoreConfig {
    /**`AccountData` instance which stores user's account data */
    accountData: AccountData;
    /**
     * Replace the `accountData` to a totally new data
     * 
     * Notice:
     * - Will NOT notify listeners if the new data is the same instance to the 
     * old one (even if the props has been changed)
     */
    updateAccountData: (newAccountData: AccountData) => void;
    /**
     * Automatically read the data from storage package and update current state
     */
    updateAccountDataFromStorage: () => Promise<void>;
}


/**
 * Store provide some codeforces account info and data
 */
export const useAccountStore = create(function (set) {
    let storeInfo: useAccountStoreConfig = {
        accountData: new AccountData(),
        updateAccountData(newAccountData) {
            set(function () {
                newAccountData.toStorage();
                return {
                    accountData: newAccountData,
                };
            });
        },
        async updateAccountDataFromStorage() {
            let newAccData = await (new AccountData()).fromStorage();
            set(() => ({ accountData: newAccData }));
        }
    }
    // add ipcRenderer refresh listener
    try {
        window.electron.ipcRenderer.on('windowmgr:signal:refresh', function () {
            storeInfo.updateAccountDataFromStorage();
        });
    } catch (e) {
        ;
    }
    return storeInfo;
}
);