// tools
import puppeteer, { Page } from 'puppeteer';
import { setDefault } from 'general/tools/set_default';
import { windowInstance } from 'main/tools/window_manage/instance';

// Configs
import * as cfConfig from './config';

// Errors
import * as errs from 'general/error/base';

// Models
// import { AccountData } from 'renderer/stores/accountStore';

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
export async function checkLoginStatus(cfPage: Page): Promise<string | undefined> {
    try {
        // get element
        let handleElement = await cfPage.waitForSelector('div.lang-chooser > div:nth-child(2)');
        // infoStrList is expected be the first and second text in the head loggin cornor
        // e.g.: ['Enter', 'Register'] or ['YourAccountHandle', 'Logout']
        if (handleElement === null) {
            throw new errs.EleCFError(
                'HeaderElementNotFound',
                'Could not found header and account element in the page when checking login status'
            );
        }
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
 * Logout the codeforces account of the received `cfPage`
 * 
 * Params:
 * - `checkStatus` If true, will check the logged in status before try log out. Default to 
 * `true` and should only set to `false` if you are very certain there is an account logged 
 * in
 */
async function logoutAccount(cfPage: Page, checkStatus?: boolean): Promise<void> {
    if (checkStatus === undefined) {
        checkStatus = true;
    }
    if (checkStatus === true && checkLoginStatus(cfPage) === undefined) {
        return;
    }
    try {
        // get element
        let handleElement = await cfPage.waitForSelector('div.lang-chooser > div:nth-child(2)');
        if (handleElement === null) {
            throw new errs.EleCFError(
                'HeaderElementNotFound',
                'Could not found header and account element in the page when checking login status'
            );
        }
        // infoStrList is expected be the first and second text in the head loggin cornor
        // e.g.: ['Enter', 'Register'] or ['YourAccountHandle', 'Logout']
        let logoutEle = await handleElement.waitForSelector('a:nth-child(2)');
        if (logoutEle === null) {
            throw new errs.EleCFError(
                'LogoutLinkNotFound',
                'Could not found logout link in codeforces page'
            );
        }
        await logoutEle.click();
        return;
    } catch (e) {
        throw new errs.EleCFError(
            'FailedToLogoutAccount',
            'Error occurred when try to logout codeforces account\n',
            `Detailed error message: ${e}`
        );
    }
}

/**
 * Account info used to return or writing into storage
 * 
 * The param meaning is same to `accountStore` in renderer process
 */
export interface AccountInfo {
    account?: string;
    password?: string;
    handle: string;
    ratings: number;
    levelName: string;
    avatarUrl: string;
}

/**
 * Returns account info like `handle` and `ratings` from a profile info page
 * 
 * Returns:
 * - `[Instance of AccountData]` The account data info, NOT include `account` and `password`
 * 
 * Notice:
 * - `profilePage` must be a valid profile page of codeforces
 */
async function getAccountInfoFromProfilePage(profilePage: Page): Promise<AccountInfo> {
    // handle and levalName info
    let mainInfoEle = await profilePage.waitForSelector('div.main-info');
    if (mainInfoEle === null) {
        throw new errs.EleCFError(
            'HandleInfoNotFound',
            'Could not found handle info in profile page'
        );
    }
    let handle = await mainInfoEle.$eval('h1', function (ele) {
        return ele.innerText;
    });
    let levelName = await mainInfoEle.$eval('div.user-rank', function (ele) {
        return ele.innerText;
    });
    // Ratings info
    let ratingsEle = await profilePage.waitForSelector(
        `li > img[title="User''s contest rating in Codeforces community"] + span`
    );
    if (ratingsEle === null) {
        throw new errs.EleCFError(
            'RatingsInfoNotFound',
            'Could not found ratings info in profile page'
        );
    }
    let ratings = parseInt(await profilePage.evaluate((ele) => ele.innerText, ratingsEle));
    // avatarUrl info
    let avatarEle = await profilePage.waitForSelector('div.title-photo img');
    if (avatarEle === null) {
        throw new errs.EleCFError(
            'AvatarInfoNotFound',
            'Could not found avatar info in profile page'
        );
    }
    let avatarUrl: string | null = await profilePage.evaluate((ele) => (ele.getAttribute('src')), avatarEle);
    if (avatarUrl === null) {
        throw new errs.EleCFError(
            'NullAvatarInfo',
            'Got null avatar info from profile page'
        );
    }
    let accountInfo: AccountInfo = {
        handle: handle,
        ratings: ratings,
        levelName: levelName,
        avatarUrl: avatarUrl,
    };
    return accountInfo;
}

export interface logInCfAccountConfig {
    account: string;
    password: string;
    /**
     * If `true`, send refresh signal to all app page after a successful login, including `mainWindow`
     */
    triggerRefresh?: boolean;
    /**
     * If `true`, update `accountInfo` storage after a successful login
     */
    updateStorage?: boolean;
}

/**
 * Try login into codeforces account using puppeteer. If succeed, write into storage 
 * and send refresh signal to all windows
 * 
 * 
 * Noitce:
 * - If the same account detected to be logged in, this function will do nothing
 * - If the different account detected to be logged in, then the previous account 
 * will be logged out before this account log in, even if this account log in process 
 * failed
 */
export async function logInCfAccount({
    account,
    password,
    triggerRefresh,
    updateStorage,
}: logInCfAccountConfig) {
    // set default
    triggerRefresh = setDefault(triggerRefresh, false);
    updateStorage = setDefault(updateStorage, false);
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
        // go to login page 
        // (notice, if there is an account logged in, codeforces will 
        // redirect to profile page of this account)
        await loginPage.goto(`${cfConfig.baseUrl}/enter`);
        // check loggin status and do some prepare
        let loggedInHandle: string | undefined = await checkLoginStatus(loginPage);
        // if current login account should log out
        if (loggedInHandle !== undefined && loggedInHandle !== account) {
            await logoutAccount(loginPage, false);
        }
        // if need to login
        if (loggedInHandle !== account) {
            let enterEle = await loginPage.waitForSelector('div.lang-chooser > div:nth-child(2) > a:nth-child(1)');
            if (enterEle === null) {
                throw new errs.EleCFError(
                    'EnterButtonNotFound',
                    'Could not found Enter button in codeforces website when ' +
                    'trying to login'
                );
            }
            await enterEle.click();
            let accountInputEle = await loginPage.waitForSelector('input#handleOrEmail');
            let passwordInputEle = await loginPage.waitForSelector('input#password');
            let rememberInputEle = await loginPage.waitForSelector('input#remember');
            // validate input element
            if (
                accountInputEle === null ||
                passwordInputEle === null ||
                rememberInputEle === null
            ) {
                throw new errs.EleCFError(
                    'CouldNotFoundInputElement',
                    'Could not found handle or password input element when try to log in'
                );
            }
            // text into input element
            await accountInputEle.type(account);
            await passwordInputEle.type(password);
            await rememberInputEle.click();
            let submitInputEle = await loginPage.waitForSelector('input.submit');
            if (submitInputEle === null) {
                throw new errs.EleCFError(
                    'SubmitButtonNotFound',
                    'Could not found submit button when try to login'
                );
            }
            await Promise.all([
                submitInputEle.click(),
                loginPage.waitForNavigation(),
            ]);
        }
        // after login, check login status and get info
        let handle = await checkLoginStatus(loginPage);
        if (handle === undefined) {
            throw new errs.EleCFError(
                'LoginFailed',
                'Failed to login into the account, please check the account and password'
            );
        }
        // goto account info page
        await loginPage.goto(`${cfConfig.baseUrl}/profile`);
        let accountInfo = await getAccountInfoFromProfilePage(loginPage);
        // fill rest info
        accountInfo.account = account;
        accountInfo.password = password;
        // write to storage if needed
        if (updateStorage === true) {
            throw new errs.EleCFError(
                'FeatureNotSupport',
                'Update storage and trigger refresh feature is currently not ' +
                'support in loginCfAccount function'
            );
        }
        // notify all windows if needed
        if (triggerRefresh === true) {
            throw new errs.EleCFError(
                'FeatureNotSupport',
                'Update storage and trigger refresh feature is currently not ' +
                'support in loginCfAccount function'
            );
        }
        return accountInfo;
    }
    catch (e) {
        throw new errs.EleCFError(
            'RequestCFError',
            'Error occurred when requesting codeforce login page\n' +
            `Detail error message:\n ${e}`
        );
    }
    finally {
        await loginPage.close();
    }
}