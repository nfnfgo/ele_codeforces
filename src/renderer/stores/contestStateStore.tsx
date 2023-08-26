import { create } from 'zustand';
import { immer as immerMiddleware } from 'zustand/middleware/immer';
import { immerable } from 'immer';

// Models
import { ContestInfo, HistoryContestInfo } from 'general/models/cf/contests';
import { ProblemInfo } from 'general/models/cf/problems';
import { SubmissionInfo } from 'general/models/codeforces';

// Tools
import { setDefault } from 'general/tools/set_default';

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
        this.judgingProblems = [];
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
     * Submission info list which stores all recent submission of this contest
     * 
     * Notice:
     * - This list could be empty if no account logged in
     */
    contestSubmissionInfo: SubmissionInfo[];
    /**
     * Problem list of currently judging problem
     * 
     * Notice:
     * - If a problem is in this list, means users has submit an answer of this problem which is still in `judging` state
     */
    judgingProblems: ProblemInfo[];

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
    updateContestId(newContestId: number): undefined {
        if (newContestId === this.contestId) {
            return;
        }
        if (newContestId === 0) {
            // clear all contest and problem info
            this.contestId = undefined;
        }
        else {
            this.contestId = newContestId;
        }
        // clear all outdated data
        this.problemId = undefined;
        this.contestSubmissionInfo = [];
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
    /**
     * Mark a problem as judging in contest state 
     * 
     * Params:
     * - `problem` ProblemInfo instance you want to add
     * - `checkDuplicate` If true, will check duplicate before added, recommend to pass `true` anytime
     */
    addJudgingProblem: (problem: ProblemInfo, checkDuplicate?: boolean) => void;
    /**Remove a problem from the judging list in contest state */
    removeJudgingProblem: (problem: ProblemInfo) => void;
    /**
     * Check if a problem is already in the juding list
     * 
     * Notice:
     * - Function consider two `problem` is equal if they has same `contestId` and `id`
     */
    isJudgingProblem: (problem: ProblemInfo) => boolean;
}


export const useContestStateStore = create(
    immerMiddleware<useContestStateStoreConfig>(function (set, get) {
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
                    state.info.updateContestId(newContestId);
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
            addJudgingProblem(problem, checkDuplicate) {
                checkDuplicate = setDefault(checkDuplicate, true);
                // check duplicated if needed
                if (checkDuplicate === true) {
                    let duplicated = get().isJudgingProblem(problem);
                    if (duplicated === true) {
                        return;
                    }
                }
                // add new problem
                set(function (state) {
                    // first check if there is already a 
                    state.info.judgingProblems.push(problem);
                });
            },
            isJudgingProblem(problem) {
                // create local checking function
                function isDuplicated(anoProblem: ProblemInfo) {
                    if (anoProblem.contestId === problem.contestId &&
                        anoProblem.id === problem.id) {
                        return true;
                    }
                    return false;
                }
                // iterate current judging list to check duplicate
                let judgingProblemList = get().info.judgingProblems;
                for (let curProblem of judgingProblemList) {
                    if (isDuplicated(curProblem) === true) {
                        return true;
                    }
                }
                // return false if no duplicate found
                return false;
            },
            removeJudgingProblem(problem) {
                function shouldKeep(anoProblem: ProblemInfo): boolean {
                    // create local should keep function
                    if (anoProblem.contestId === problem.contestId && anoProblem.id === problem.id) {
                        return false;
                    }
                    return true;
                }
                // update state
                set(function (state) {
                    let newJudgingList: ProblemInfo[] = state.info.judgingProblems.filter(shouldKeep);
                    state.info.judgingProblems = newJudgingList;
                });
            },
        };
        // add ipcRenderer refresh listener
        window.electron.ipcRenderer.on('windowmgr:signal:refresh', function () {
            state.info.fromStorageTest();
        });
        return state;
    }));