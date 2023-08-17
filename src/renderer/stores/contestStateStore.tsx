import { create } from 'zustand';
import { immer as immerMiddleware } from 'zustand/middleware/immer';
import { immerable } from 'immer';

import { ContestInfo, HistoryContestInfo } from 'main/api/cf/contests';

/**
 * Used to store user selection state about contests like contestId, problemId, etc
 */
export class ContestStateData {
    // Support immer middleware
    [immerable] = true;

    constructor() {
        this.contestId = undefined;
        this.problemId = undefined;
        this.contestsInfo = [];
        this.historyContestsInfo = [];
        this.hideContestListUI = false;
    }
    /**Codeforces ID of user selected contest */
    contestId?: number;
    /**Problem ID of user selected problems */
    problemId?: string;
    /**Incoming contest info list */
    contestsInfo: ContestInfo[];
    /**History contest info list (which user can select and check problems) */
    historyContestsInfo: HistoryContestInfo[];
    /**If true, the contest list will auto collapsed */
    hideContestListUI: boolean;

    /**
     * Update contestId of this state data
     * 
     * Params:
     * - `newContestId` The new contest id. Set to `0` to clear all contest and 
     * problem info
     * 
     * Notice:
     * - This function will set `problemId` to `undefined` since 
     * the problemId of the previous contest may be invalid
     */
    updateContestId(newContestId: number) {
        if (newContestId === 0) {
            // clear all contest and problem info
            this.contestId = undefined;
            this.problemId = undefined;
        }
    }

    /**Update problem id of this contest state */
    updateProblemId(newProblemId: string) {
        this.problemId = newProblemId;
    }

    async fromStorageTest() {
        console.log('Contest state from storage test called');
    }
}

export interface useContestStateStoreConfig {
    /**Contest state info */
    info: ContestStateData;
    /**The version number of current state
     * 
     * If you want a component to refresh after calling `notifyVersionListeners()`, then 
     * you should require `stateVersion` in this component
     */
    stateVersion: number;
    /**Notify all components which required on `stateVersion` */
    notifyVersionListeners: () => void;
    /**
     * Update infos in this state
     * 
     * Params:
     * - `mutateFn` The function to update state. To update state, directly make changes on received 
     * `stateDraft` params in this function
     */
    updateState: <CbReturnType>(mutateFn: (stateDraft: useContestStateStoreConfig) => (CbReturnType)) => (CbReturnType);
    /**Update contest id in contest state */
    updateContestId: (newContestId: number) => void;
    /**Update problem id in contest state */
    updateProblemId: (newProblemId: string) => void;
    /**Trigger hide contest list */
    triggerHideContestList: () => void;
}


export const useContestStateStore = create(
    immerMiddleware<useContestStateStoreConfig>(function (set) {
        console.log('New contest state store instance created');
        let state: useContestStateStoreConfig = {
            info: new ContestStateData(),
            stateVersion: 0,
            notifyVersionListeners() {
                set((state) => {
                    state.stateVersion++;
                })
            },
            updateState(mutateFn) {
                let ret: any;
                set(function (state: useContestStateStoreConfig) {
                    ret = mutateFn(state);
                });
                return ret;
            },
            updateContestId(newContestId) {
                set(function (state) {
                    state.info.contestId = newContestId;
                    state.info.problemId = undefined;
                });
            },
            updateProblemId(newProblemId) {
                set(function (state) {
                    state.info.updateProblemId(newProblemId);
                });
            },
            triggerHideContestList() {
                set(function (state) {
                    state.info.hideContestListUI = !state.info.hideContestListUI;
                });
            },
        };
        // add ipcRenderer refresh listener
        window.electron.ipcRenderer.on('windowmgr:signal:refresh', function () {
            state.info.fromStorageTest();
        });
        return state;
    }));