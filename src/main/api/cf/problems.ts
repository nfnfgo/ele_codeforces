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
        await problemInfoPage.goto(`${cfConfig.baseUrl}/contest/${contestId}`);
        let tbodySelector = '#pageContent > .datatable > div > table.problems > tbody';
        let problemsTbody = await problemInfoPage.waitForSelector(tbodySelector);
        // extract info
        problemInfoList = await problemsTbody.$$eval('tr', function (trList, contestId) {
            let resList: ProblemInfo[] = [];
            let cnt: number = trList.length;
            for (let i: number = 1; i < cnt; ++i) {
                let curTrEle = trList[i];
                let tdList = curTrEle.getElementsByTagName('td');
                resList.push({
                    contestId: contestId,
                    id: tdList[0].innerText,
                    name: (tdList[1].querySelector('div > div > a') as HTMLAnchorElement).innerText,
                    limit: tdList[1].querySelector('div > div.notice').childNodes[2].nodeValue.trim(),
                    solvedCount: parseInt(tdList[3].querySelector('a').innerText.trim().substring(1)),
                });
            }
            return resList;
        }, contestId);
        problemInfoPage.close();
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
    description: string;
    /**HTML format string contains input specification */
    inputSpec: string;
    /**HTML format string contains output specification */
    outputSpec: string;
    /**HTML format string contains testcases samples */
    samples: string;
    /**HTML format string containse input and output note */
    note: string;
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
    //div.problem-statement > div.header + div
    await detailedProblemPage.goto(`${cfConfig.baseUrl}/contest/${contestId}/problem/${problemId}`);
    let problemStatementEle = await detailedProblemPage.waitForSelector('div.problem-statement');
    // description
    let description = await problemStatementEle.$eval('div.header + div', function (ele) {
        return ele.innerHTML;
    });
    // input
    let inputSpec = await problemStatementEle.$eval('div.input-specification', function (ele) {
        return ele.innerHTML;
    });
    // output
    let outputSpec = await problemStatementEle.$eval('div.output-specification', function (ele) {
        return ele.innerHTML;
    });
    // samples
    let samples = await problemStatementEle.$eval('div.sample-tests', function (ele) {
        return ele.innerHTML;
    });
    // note
    let note = await problemStatementEle.$eval('div.note', function (ele) {
        return ele.innerHTML;
    });
    // Close page
    await detailedProblemPage.close();
    // return 
    return {
        contestId: contestId,
        id: problemId,
        description: description,
        inputSpec: inputSpec,
        outputSpec: outputSpec,
        samples: samples,
        note: note,
    };
}