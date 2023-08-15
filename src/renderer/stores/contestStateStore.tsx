import { create } from 'zustand';

/**
 * Used to store user selection state about contests like contestId, problemId, etc
 */
class ContestStateData {
    constructor() {
        this.contestId = undefined;
        this.problemId = undefined;
    }
    /**Codeforces ID of user selected contest */
    contestId?: number;
    /**Problem ID of user selected problems */
    problemId?: string;

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
}

export const useContestStateStore = create(function (set) {
    let state: useContestStateStoreConfig = {
        info: new ContestStateData(),
        stateVersion: 0,
        notifyVersionListeners() {
            set((state: useContestStateStoreConfig) => ({
                stateVersion: state.stateVersion + 1,
            }));
        },
    };
    return state;
});