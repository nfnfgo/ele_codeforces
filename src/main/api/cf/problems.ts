// Configs
import { title } from 'process';
import * as cfConfig from './config';

// Errors
import * as errs from 'general/error/base';

export interface ProblemInfo {
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
    if(contestId === undefined){
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
        problemInfoList = await problemsTbody.$$eval('tr', function (trList) {
            let resList: ProblemInfo[] = [];
            let cnt: number = trList.length;
            for (let i: number = 1; i < cnt; ++i) {
                let curTrEle = trList[i];
                let tdList = curTrEle.getElementsByTagName('td');
                resList.push({
                    id: tdList[0].innerText,
                    name: (tdList[1].querySelector('div > div > a') as HTMLAnchorElement).innerText,
                    limit: tdList[1].querySelector('div > div.notice').childNodes[2].nodeValue.trim(),
                    solvedCount: parseInt(tdList[3].querySelector('a').innerText.trim().substring(1)),
                });
            }
            return resList;
        });
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