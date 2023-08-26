import { create } from 'zustand';
import { immer as immerMiddleware } from 'zustand/middleware/immer';
import { immerable } from 'immer';

// Models
import { ContestInfo, HistoryContestInfo } from 'general/models/cf/contests';
import { SubmissionInfo, cfSupportProgramLangList } from 'general/models/codeforces';

// Errors
import * as errs from 'general/error/all';

/**
 * Data class used to store settings of ele cf app
 */
export class EleSettingsData {
    constructor() {
        this.defaultSubmitLangValue = undefined;
    }
    /**
     * The default submit codeforces language value
     * 
     * For more info about lang value, see `cfSupportProgramLangList`
     */
    defaultSubmitLangValue: number | undefined;

    /**
     * Convert class intance to a props
     */
    toProps(): any {
        return JSON.parse(JSON.stringify(this));
    }

    /**
     * Update data of this class from a props
     */
    fromProps(props: any): void {
        try {
            this.defaultSubmitLangValue = props.defaultSubmitLangValue;
        } catch (e) {
            throw e;
        }
    }
}

export interface useSettingsStoreConfig {
    /**Current settings data state instance */
    info: EleSettingsData;
    /**
     * Update this settings state through a `mutateFn` function
     * 
     * Params:
     * - `mutateFn` The function that receive a `draft` copy of current state 
     * and directly makes changes on the `draft`. All the changes will be later 
     * synchronized to the `state`
     * 
     * Returns:
     * - Returns the value of what `mutateFn` returns
     */
    update: <MuReturnType>(mutateFn: (draft: useSettingsStoreConfig) => (MuReturnType)) => MuReturnType;
    /**Save settings data to storage by sending IPC message */
    toStorage: () => (Promise<void>);
    /**Read storage and update the settings state */
    fromStorage: () => (Promise<void>);
    /**Update default codeforces submission lnag value */
    updateDefaultCfLang: (langValue?: number) => (void);
}

export const useSettingsStore = create(
    immerMiddleware<useSettingsStoreConfig>(function (set, get) {
        let stateIns: useSettingsStoreConfig = {
            info: new EleSettingsData(),
            update(mutateFn) {
                let ret;
                set(function (state) {
                    ret = mutateFn(state);
                });
                return ret;
            },
            async toStorage(): Promise<void> {
                await window.electron.ipcRenderer.invoke(
                    'storage:eleCfConfig:setInfo', // channel name
                    'settingsInfo', // props name in the storage of `eleCfConfig`
                    get().info.toProps(), // data need to be stored
                );
            },
            async fromStorage() {
                let props = await window.electron.ipcRenderer.invoke(
                    'storage:eleCfConfig:getInfo',
                    'settingsInfo',
                );
                try {
                    set(function (state) {
                        state.info.fromProps(props);
                    });
                } catch (e) {
                    throw new errs.stores.ReadStorageError('settingsInfo', e);
                }
            },
            updateDefaultCfLang(langValue) {
                set(function (state) {
                    state.info.defaultSubmitLangValue = langValue;
                });
            },
        };
        // add refresh listener
        window.electron.ipcRenderer.on('windowmgr:signal:refresh', function () {
            stateIns.fromStorage();
        });
        // load from storage when init
        stateIns.fromStorage();
        return stateIns;
    })
);