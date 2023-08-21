
export interface getContestSubmissionInfoConfig {
    contestId: number;
}

export interface ContestInfo {
    name: string;
    writer: string;
    start: string;
    length: string;
};

export interface HistoryContestInfo {
    name: string;
    contestId: number;
    writer: string;
    start: string;
    length: string;
};

export interface getContestSubmissionInfoConfig {
    contestId: number;
    /**If ture, will check login status and throw error if no account login */
    checkLogin?: boolean;
}