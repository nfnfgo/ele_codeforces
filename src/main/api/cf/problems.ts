// Configs
import { title } from 'process';
import * as cfConfig from './config';

// Errors
import * as errs from 'general/error/base';

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

/**
 * Get problem base info of specified contest based on the contestId
 */
export async function getContestProblems(contestId: number): Promise<ProblemInfo[]> {
    if (contestId === undefined) {
        throw new errs.EleCFError(
            'ContestIdRequired',
            'ContestId must be provided when requesting problem data from Codeforces'
        );
    }
    try {
        // Store the problems result
        let problemInfoList: ProblemInfo[] = [];
        // get browser and element needed
        let browser = await cfConfig.CFBrowser.getCfBrowser();
        let problemInfoPage = await browser.newPage();
        try {
            await problemInfoPage.goto(`${cfConfig.baseUrl}/contest/${contestId}`);
            let tbodySelector = '#pageContent > .datatable > div > table.problems > tbody';
            let problemsTbody = await problemInfoPage.waitForSelector(tbodySelector);
            // extract info
            problemInfoList = await problemsTbody!.$$eval('tr', function (trList, contestId) {
                let resList: ProblemInfo[] = [];
                let cnt: number = trList.length;
                for (let i: number = 1; i < cnt; ++i) {
                    let curTrEle = trList[i];
                    let tdList = curTrEle.getElementsByTagName('td');
                    resList.push({
                        contestId: contestId,
                        id: tdList[0].innerText,
                        name: (tdList[1].querySelector('div > div > a') as HTMLAnchorElement).innerText,
                        limit: tdList[1].querySelector('div > div.notice')!.childNodes[2].nodeValue!.trim(),
                        solvedCount: parseInt(tdList[3].querySelector('a')!.innerText.trim().substring(1)),
                    });
                }
                return resList;
            }, contestId);
        } catch (e) {
            throw new Error('Failed to request contest problems data');
        } finally {
            await problemInfoPage.close();
        }
        return problemInfoList;
    }
    catch (e) {
        throw new errs.EleCFError(
            'RequestError',
            'Error occurred when requesting problem data from Codeforces\n' +
            `Detail error message: ${e}`
        );
    }
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

/**
 * Get detail info of problem like description and testcase
 */
export async function getProblemDetailedInfo({ contestId, problemId }: getProblemDetailConfig): Promise<ProblemDetailedInfo> {
    if (contestId === undefined || problemId === undefined) {
        throw new errs.EleCFError(
            'ParamsUndefined',
            'ContestId and problemId could not be undefined\n' +
            `Props received: ${JSON.stringify({ contestId: contestId, problemId: problemId })}`
        );
    }
    let browser = await cfConfig.CFBrowser.getCfBrowser();
    let detailedProblemPage = await browser.newPage();
    let detailProblemProp: ProblemDetailedInfo | undefined = undefined;
    try {//div.problem-statement > div.header + div
        await detailedProblemPage.goto(`${cfConfig.baseUrl}/contest/${contestId}/problem/${problemId}`);
        let problemStatementEle = await detailedProblemPage.waitForSelector('div.problem-statement');
        if (problemStatementEle === null) {
            throw new errs.EleCFError(
                'ProblemStatementNotFound',
                'Could not found problem statement element'
            )
        }
        // description
        let description;
        try {
            description = await problemStatementEle.$eval('div.header + div', function (ele) {
                return ele.innerHTML;
            });
        } catch (e) {
            ;
        }
        // input
        let inputSpec = await problemStatementEle.$eval('div.input-specification', function (ele) {
            return ele.innerHTML;
        });
        // output
        let outputSpec = await problemStatementEle.$eval('div.output-specification', function (ele) {
            return ele.innerHTML;
        });
        // samples
        let samples;
        try {
            samples = await problemStatementEle.$eval('div.sample-tests', function (ele) {
                return ele.innerHTML;
            });
        } catch (e) {
            ;
        }
        // note
        let note;
        try {
            note = await problemStatementEle.$eval('div.note', function (ele) {
                return ele.innerHTML;
            });
        } catch (e) {
            ;
        }
        detailProblemProp = {
            contestId: contestId,
            id: problemId,
            description: description,
            inputSpec: inputSpec,
            outputSpec: outputSpec,
            samples: samples,
            note: note,
        };
    } catch (e) {
        throw new errs.EleCFError('RequestDetailedProblemInfoFailed',
            'Error occurred when requesting detailed problem info\n' +
            `Detail error message: ${e}`);
    } finally {
        await detailedProblemPage.close();
    }

    // return 
    return detailProblemProp;
}



/**
 * Submission info interface, contains basic info for a submission
 */
export interface SubmissionInfo {
    /**Codeforces ID of this submission */
    submissionId: number;
    /**Submission time of this answer */
    time: string;
    /**Full name of this problem */
    problemFullName: string;
    /**Name of the language used when submit */
    langName: string;
    /**Verdict of this submission, e.g.:`Accepted` */
    verdict: string;
    /**Timed consumed, `ms` */
    timeConsumed: number;
    /**Memory consumed, `KB` */
    memoryConsumed: number;
}

interface submitProblemConfig {
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

/**
 * Submit answer to a specified problem
 * 
 * Returns:
 * - `[Instance of SubmissionInfo]` if submit succeed AND cf returns an valid verdict. 
 * This means function will NOT return until judge finished
 * 
 * Exceptions:
 * - `LoggedInAccountRequired` Could not found a logged in account when trying to submit 
 * answer 
 */
async function submitProblem({
    contestId,
    problemId,
    ansCodeString,
    langValue,
}: submitProblemConfig): Promise<SubmissionInfo> {
    let browser = await cfConfig.CFBrowser.getCfBrowser();
    let submitPage = await browser.newPage();
    try {
        // goto problem submit page
        await submitPage.goto(`${cfConfig.baseUrl}/contest/${contestId}/submit/${problemId}`);
        // check account login status
        // select lang
        // type answer
        // submit and waitfornav
        // wait for valid verdict
        // return
    } catch (e) {
        if (e instanceof errs.EleCFError) {
            throw e;
        }
        else {
            throw new errs.EleCFError(
                'AnswerSubmissionFailed',
                'Error occurred when trying to submit an answer to codeforces\n' +
                `Detail error message: ${e}`
            )
        }
    } finally {
        await submitPage.close();
    }
}