
export interface ProblemInfo {
    /**ContestId of the contest which this problems appeared in */
    contestId: number;
    /**ProblemID, which used as the link param of the problem. E.g: A1 */
    id: string;
    /**Name of this problem */
    name: string;
    /**Limit of this problem, e.g.: 256 MB, 1 s */
    limit: string;
    /**Number of person who had solved this problem */
    solvedCount: number;
}

export interface ProblemDetailedInfo {
    /**ContestId of the contest which this problem in */
    contestId: number,
    /**Id of this problem */
    id: string,
    /**HTML format string contains question description info*/
    description?: string;
    /**HTML format string contains input specification */
    inputSpec: string;
    /**HTML format string contains output specification */
    outputSpec: string;
    /**HTML format string contains testcases samples */
    samples?: string;
    /**HTML format string containse input and output note */
    note?: string;
}

export interface getProblemDetailConfig {
    contestId: number;
    problemId: string;
}

export interface submitProblemConfig {
    contestId: number;
    problemId: string;
    /**
     * The code answer of this problem
     */
    ansCodeString: string;
    /**
     * The lang value in `cfConfig` of the language type. Use default language 
     * if `undefined`
     * 
     * Check more info about language `value` in `./config > cfSupportProgramLangList`
     */
    langValue: number;
}