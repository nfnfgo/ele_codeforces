// IPC
import { ipcMain } from 'electron';

// Tools
import puppeteer from 'puppeteer';

// Configs
import * as cfConfig from './config';

// Errors
import * as errs from 'general/error/base';

export interface ContestInfo {
    name: string;
    writer: string;
    start: string;
    length: string;
};

export async function getContestList(): Promise<ContestInfo[]> {
    try {
        let browser = await cfConfig.CFBrowser.getCfBrowser();
        let cfContestPage = await browser.newPage();
        await cfContestPage.goto(`${cfConfig.baseUrl}/${cfConfig.contestsUrl}`);
        let contestTableEle = await cfContestPage.waitForSelector('div.contestList > div.datatable > div > table > tbody');
        let infoList = await contestTableEle.$$eval('tr', function (eleList) {
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
        cfContestPage.close();
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