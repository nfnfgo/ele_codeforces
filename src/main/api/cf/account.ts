// tools
import puppeteer, { Page } from 'puppeteer';

// Configs
import * as cfConfig from './config';

// Errors
import * as errs from 'general/error/base';

/**
 * Check if there is an account logged into codeforces website in puppeteer
 * 
 * Returns:
 * - `undefined` No account logged in
 * - `string` The handle of the logged in account
 * 
 * Notice:
 * - `cfPage` must have been in a codeforces official page before pass and could not 
 * changed during process
 */
async function checkLoginStatus(cfPage: Page): Promise<string | undefined> {
    try {// get element
        let handleElement = await cfPage.waitForSelector('div.lang-chooser > div:nth-child(2)');
        // infoStrList is expected be the first and second text in the head loggin cornor
        // e.g.: ['Enter', 'Register']
        let infoStrList: string[] = await handleElement.$$eval('a', function (aEleList) {
            let infoList: string[] = [];
            for (let aEle of aEleList) {
                infoList.push(aEle.text);
            }
            return infoList;
        });
        // Return value
        // if no account logged in
        if (infoStrList[0] === 'Enter' || infoStrList[1] === 'Register') {
            return undefined;
        }
        // if account logged in, return handle of this account
        else {
            return infoStrList[0];
        }
    } catch (e) {
        throw new errs.EleCFError(
            'FailedToGetAccountLogInStatus',
            'Error occurred when detect the account login status on codeforces website\n',
            `Detailed error message: ${e}`
        );
    }
}


/**
 * Try login into codeforces account using puppeteer
 * 
 * Noitce:
 * - If the same account detected to be logged in, this function will do nothing
 * - If the different account detected to be logged in, then the previous account 
 * will be logged out before this account log in, even if this account log in process 
 * failed
 */
export async function logInCfAccount(account: string, password: string) {
    // validate params
    let lackParam = false;
    if (account === undefined || account === null) {
        lackParam = true;
    }
    else if (password === undefined || password === null) {
        lackParam = true;
    }
    if (lackParam === true) {
        throw new errs.EleCFError(
            'AccountAndPasswordRequired',
            'Login into codeforces need both account and password info'
        );
    }
    // try login
    let browser = await cfConfig.CFBrowser.getCfBrowser();
    let loginPage = await browser.newPage();
    try {
        await loginPage.goto(`${cfConfig.baseUrl}/enter`);
    }
    catch (e) {
        throw new errs.EleCFError(
            'RequestCFError',
            'Error occurred when requesting codeforce login page\n' +
            `Detail error message: ${e}`
        );
    }
    finally {
        await loginPage.close();
    }
}