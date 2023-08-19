// Configs
import * as cfConfig from './config';

// Errors
import * as errs from 'general/error/base';

// Models
import { SubmissionInfo } from 'general/models/codeforces';

import { getSubmissionsInfo } from './problems';

export interface ContestInfo {
    name: string;
    writer: string;
    start: string;
    length: string;
};

/**
 * Get info of upcoming contest
 */
export async function getContestList(): Promise<ContestInfo[]> {
    try {
        let browser = await cfConfig.CFBrowser.getCfBrowser();
        let cfContestPage = await browser.newPage();
        let infoList: ContestInfo[] = [];
        try {
            await cfContestPage.goto(`${cfConfig.baseUrl}/${cfConfig.contestsUrl}`);
            let contestTableEle = await cfContestPage.waitForSelector('div.contestList > div.datatable > div > table > tbody');
            infoList = await contestTableEle!.$$eval('tr', function (eleList) {
                let contestList: ContestInfo[] = [];
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
        throw new errs.EleCFError(
            'RequestInfoError',
            'Error occurred when requesting info from codeforces.\n' +
            'Detailed error message: ' +
            `${e}`
        );
    }
}


/**
 * Get the info of the histroy contest
 */
export interface HistoryContestInfo {
    name: string;
    contestId: number;
    writer: string;
    start: string;
    length: string;
};

export async function getHistoryContestInfo(): Promise<HistoryContestInfo[]> {
    try {
        // open browser and get the element
        let browser = await cfConfig.CFBrowser.getCfBrowser();
        let cfContestPage = await browser.newPage();
        let historyContestInfoList: HistoryContestInfo[] = [];
        try {
            await cfContestPage.goto(`${cfConfig.baseUrl}/${cfConfig.contestsUrl}`);
            let historyInfoSelectorStr: string = 'div.contestList > div.contests-table > div.datatable > div > table > tbody';
            let table = await cfContestPage.waitForSelector(historyInfoSelectorStr);
            // extract info from element
            historyContestInfoList = await table!.$$eval('tr[data-contestid]', function (eleList) {
                let infoList: HistoryContestInfo[] = [];
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
        throw new errs.EleCFError(
            'RequestInfoError',
            'Error occurred when requesting info from codeforces.\n' +
            'Detailed error message: ' +
            `${e}`
        );
    }
}