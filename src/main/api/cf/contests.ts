// Configs
import * as cfConfig from './config';

// Errors
import * as errs from 'general/error/all';

// Models
import { SubmissionInfo } from 'general/models/codeforces';
import * as cfContestModel from 'general/models/cf/contests';
import * as cfConfg from './config';

// Tools
import { setDefault } from 'general/tools/set_default';

import { getSubmissionsInfo } from './problems';
import { checkLoginStatus } from './account';

/**
 * Get info of upcoming contest
 */
export async function getContestList(): Promise<cfContestModel.ContestInfo[]> {
    try {
        let browser = await cfConfig.CFBrowser.getCfBrowser();
        let cfContestPage = await browser.newPage();
        let infoList: cfContestModel.ContestInfo[] = [];
        try {
            await cfContestPage.goto(`${cfConfig.baseUrl}/${cfConfig.contestsUrl}`);
            let contestTableEle = await cfContestPage.waitForSelector('div.contestList > div.datatable > div > table > tbody');
            infoList = await contestTableEle!.$$eval('tr', function (eleList) {
                let contestList: cfContestModel.ContestInfo[] = [];
                let cnt = eleList.length;
                // Deal with every single line(tr) of this table
                for (let i = 1; i < cnt; ++i) {
                    let curContestTrs = eleList[i].getElementsByTagName('td');
                    contestList.push({
                        name: curContestTrs[0].innerText,
                        writer: curContestTrs[1].innerText,
                        start: curContestTrs[2].innerText,
                        length: curContestTrs[3].innerText,
                    });
                }
                return contestList;
            });
        } catch (e) {
            throw new Error('Failed to get contest list');
        }
        finally {
            await cfContestPage.close();
        }
        return infoList;
    }
    catch (e) {
        throw new errs.base.EleCFError(
            'RequestInfoError',
            'Error occurred when requesting info from codeforces.\n' +
            'Detailed error message: ' +
            `${e}`
        );
    }
}

export async function getHistoryContestInfo(): Promise<cfContestModel.HistoryContestInfo[]> {
    try {
        // open browser and get the element
        let browser = await cfConfig.CFBrowser.getCfBrowser();
        let cfContestPage = await browser.newPage();
        let historyContestInfoList: cfContestModel.HistoryContestInfo[] = [];
        try {
            await cfContestPage.goto(`${cfConfig.baseUrl}/${cfConfig.contestsUrl}`);
            let historyInfoSelectorStr: string = 'div.contestList > div.contests-table > div.datatable > div > table > tbody';
            let table = await cfContestPage.waitForSelector(historyInfoSelectorStr);
            // extract info from element
            historyContestInfoList = await table!.$$eval('tr[data-contestid]', function (eleList) {
                let infoList: cfContestModel.HistoryContestInfo[] = [];
                let cnt: number = eleList.length;
                for (let i: number = 0; i < cnt; ++i) {
                    let curEleTdList = eleList[i].getElementsByTagName('td');
                    infoList.push({
                        name: curEleTdList[0].childNodes[0].nodeValue!,
                        contestId: parseInt(eleList[i].getAttribute('data-contestid')!),
                        writer: curEleTdList[1].innerText,
                        start: curEleTdList[2].innerText,
                        length: curEleTdList[3].innerText,
                    });
                }
                return infoList;
            });
        } catch (e) {
            throw new Error('Failed to request contest data\n' +
                `Detail error messgae: ${e}`);
        } finally {
            await cfContestPage.close();
        }
        return historyContestInfoList;
    }
    catch (e) {
        throw new errs.base.EleCFError(
            'RequestInfoError',
            'Error occurred when requesting info from codeforces.\n' +
            'Detailed error message: ' +
            `${e}`
        );
    }
}

/**
 * Get submissions info of a contest based on codeforces contest id
 * 
 * Notice:
 * - This function will create a new browser page to request info, if 
 * you already have a `page` in submission page, you can call 
 * `getSubmissionsInfo` in `./problem`
 * - Always set `checkLogin` to `true` if you are not confirm if a valid account has 
 * logged in
 */
export async function getContestSubmissionInfo({
    contestId,
    checkLogin,
}: cfContestModel.getContestSubmissionInfoConfig): Promise<SubmissionInfo[]> {
    checkLogin = setDefault(checkLogin, true);
    let browser = await cfConfig.CFBrowser.getCfBrowser();
    let submissionPage = await browser.newPage();
    try {
        await submissionPage.goto(`${cfConfg.baseUrl}/contest/${contestId}/my`);
        // check login status if needed 
        if (checkLogin === true) {
            let handle = await checkLoginStatus(submissionPage);
            if (handle === undefined) {
                throw new errs.api.LoggedInAccountRequired(
                    'Must log in an account to acquire submission info'
                );
            }
        }
        let submissionInfo: SubmissionInfo[] = await getSubmissionsInfo(submissionPage);
        return submissionInfo;
    } catch (e) {
        if (e instanceof errs.base.EleCFError) {
            throw e;
        }
        else {
            throw new errs.base.EleCFError(
                'RequestSubmissionInfoFailed',
                'Error occurred when requesting submissions data\n' +
                `ContestID: ${contestId}` +
                `Detailed error message: ${e}`
            );
        }
    } finally {
        await submissionPage.close();
    }
}