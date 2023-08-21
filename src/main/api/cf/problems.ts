import { Page } from 'puppeteer';
import { app } from 'electron';
import path from 'path';

// Configs
import { title } from 'process';
import * as cfConfig from './config';

// account
import { checkLoginStatus } from './account';

// Errors
import * as errs from 'general/error/all';

// Tools
import { asyncSleep } from 'general/tools/async_sleep';
import { createDirIfNotExist } from 'general/tools/file';

// Models
import { SubmissionInfo, SupportLangItem, cfSupportProgramLangList } from 'general/models/codeforces';
import * as cfProblemModel from 'general/models/cf/problems';



/**
 * Get problem base info of specified contest based on the contestId
 */
export async function getContestProblems(contestId: number): Promise<cfProblemModel.ProblemInfo[]> {
    if (contestId === undefined) {
        throw new errs.base.EleCFError(
            'ContestIdRequired',
            'ContestId must be provided when requesting problem data from Codeforces'
        );
    }
    try {
        // Store the problems result
        let problemInfoList: cfProblemModel.ProblemInfo[] = [];
        // get browser and element needed
        let browser = await cfConfig.CFBrowser.getCfBrowser();
        let problemInfoPage = await browser.newPage();
        try {
            await problemInfoPage.goto(`${cfConfig.baseUrl}/contest/${contestId}`);
            let tbodySelector = '#pageContent > .datatable > div > table.problems > tbody';
            let problemsTbody = await problemInfoPage.waitForSelector(tbodySelector);
            // extract info
            problemInfoList = await problemsTbody!.$$eval('tr', function (trList, contestId) {
                let resList: cfProblemModel.ProblemInfo[] = [];
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
        throw new errs.base.EleCFError(
            'RequestError',
            'Error occurred when requesting problem data from Codeforces\n' +
            `Detail error message: ${e}`
        );
    }
}

/**
 * Get detail info of problem like description and testcase
 */
export async function getProblemDetailedInfo({
    contestId,
    problemId
}: cfProblemModel.getProblemDetailConfig): Promise<cfProblemModel.ProblemDetailedInfo> {
    if (contestId === undefined || problemId === undefined) {
        throw new errs.base.EleCFError(
            'ParamsUndefined',
            'ContestId and problemId could not be undefined\n' +
            `Props received: ${JSON.stringify({ contestId: contestId, problemId: problemId })}`
        );
    }
    let browser = await cfConfig.CFBrowser.getCfBrowser();
    let detailedProblemPage = await browser.newPage();
    let detailProblemProp: cfProblemModel.ProblemDetailedInfo | undefined = undefined;
    try {//div.problem-statement > div.header + div
        await detailedProblemPage.goto(`${cfConfig.baseUrl}/contest/${contestId}/problem/${problemId}`);
        let problemStatementEle = await detailedProblemPage.waitForSelector('div.problem-statement');
        if (problemStatementEle === null) {
            throw new errs.base.EleCFError(
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
        throw new errs.base.EleCFError('RequestDetailedProblemInfoFailed',
            'Error occurred when requesting detailed problem info\n' +
            `Detail error message: ${e}`);
    } finally {
        await detailedProblemPage.close();
    }

    // return 
    return detailProblemProp;
}



/**
 * Submit answer to a specified problem
 * 
 * Returns:
 * - `[Instance of SubmissionInfo][]` Return a list of `SubmissionInfo` contains ALL submissions 
 * in this contest.
 * 
 * Notice:
 * - Function will wait for the newest submission verdict to be valid before return (that means judge finished)
 * 
 * Exceptions:
 * - `LoggedInAccountRequired` Could not found a logged in account when trying to submit 
 * answer 
 * - `SameCodeSubmitted` This account have submitted exactly the same code before
 * - `AnswerTestingTimeOut` Cost too long time to wait for newest submission verdict to be valid
 */
export async function submitProblem({
    contestId,
    problemId,
    ansCodeString,
    langValue,
}: cfProblemModel.submitProblemConfig): Promise<SubmissionInfo[]> {
    let browser = await cfConfig.CFBrowser.getCfBrowser();
    let submitPage = await browser.newPage();
    try {
        // goto problem submit page
        await submitPage.goto(`${cfConfig.baseUrl}/contest/${contestId}/submit/${problemId}`);
        // check account login status
        try {
            let handle = await checkLoginStatus(submitPage);
            if (handle === undefined) {
                throw new Error();
            }
        } catch (e) {
            throw new errs.base.EleCFError(
                'LoggedInAccountRequired',
                'Logged in account required before submit answer'
            );
        }
        // select lang
        let langItem: SupportLangItem | undefined = undefined;
        for (let curLangItem of cfSupportProgramLangList) {
            if (curLangItem.value === langValue) {
                langItem = curLangItem;
                break;
            }
        }
        if (langItem === undefined) {
            throw new errs.base.EleCFError(
                'LanguageNotFound',
                `Could not found a support language type with language value ${langValue}`,
            );
        }
        let selectLangEle = await submitPage.$('select[name="programTypeId"]');
        if (selectLangEle === null) {
            // if insufficient lang value
            throw new errs.api.EleCFElementNotFound('langSelectEle in answer submit page');
        }
        submitPage.evaluate(function (ele, langValue) {
            ele.value = langValue.toString();
        }, selectLangEle, langValue);
        // type answer
        let answerTextEle = await submitPage.$('div.ace_scroller');
        if (answerTextEle === null) {
            throw new errs.api.EleCFElementNotFound('answerTextInputEle in answer submit page');
        }
        await answerTextEle.click();
        await submitPage.keyboard.type(ansCodeString);
        // submit and waitfornav
        let submitButtonEle = await submitPage.$('input.submit');
        if (submitButtonEle === null) {
            throw new errs.api.EleCFElementNotFound('submitButton in answer submit page');
        }
        await Promise.all([
            submitButtonEle.click(),
            submitPage.waitForNavigation(),
        ]);
        // wait for valid verdict
        // if (await submitPage.$('span.error.for__source') !== null) {
        //     // if submit failed since of same code policy
        //     throw new errs.base.EleCFError(
        //         'SameCodeSubmitted',
        //         'This account have submitted exactly the same code before',
        //     );
        // }

        // let screenshotPath = path.join(
        //     app.getPath('userData'),
        //     'config',
        //     'browserData',
        //     'debug',
        //     'screenshot',
        //     'test.png'
        // );
        // createDirIfNotExist(path.join(
        //     app.getPath('userData'),
        //     'config',
        //     'browserData',
        //     'debug',
        //     'screenshot',
        // ));
        // await submitPage.screenshot({
        //     path: screenshotPath
        // });
        // console.log('Screenshot saved');
        // console.log(screenshotPath);

        let submittedVerdictEle = await submitPage.$('td.status-verdict-cell');
        if (submittedVerdictEle === null) {
            throw new errs.api.EleCFElementNotFound('verdict status Ele in answer submit page');
        }
        async function getWaitingStatus() {
            return await submitPage.evaluate(function (ele) {
                let waitingRes = ele?.getAttribute('waiting');
                if (typeof (waitingRes) !== 'string') {
                    return true;
                }
                else {
                    return JSON.parse(waitingRes);
                }
            }, submittedVerdictEle);
        }
        let triedTimes: number = 0;
        let triedDelayMs: number = 1000;
        while (await getWaitingStatus() === true) {
            ++triedTimes;
            if (triedTimes > 60) {
                throw new errs.base.EleCFError(
                    'AnswerTestingTimeOut',
                    'This answer cost too many time testing',
                );
            }
            await asyncSleep(triedDelayMs);
        }
        // finish answer testing, start extracting data
        return await getSubmissionsInfo(submitPage);
    } catch (e) {
        if (e instanceof errs.base.EleCFError) {
            throw e;
        }
        else {
            throw new errs.base.EleCFError(
                'AnswerSubmissionFailed',
                'Error occurred when trying to submit an answer to codeforces\n' +
                `Detail error message: ${e}`
            )
        }
    } finally {
        await submitPage.close();
    }
}

/**
 * Get submission info from a codeforces submission page
 * 
 * Params:
 * - `submissionPage` Puppeteer `Page` instance, which is currently in a codeforces submission page, and 
 * this page should NOT redirect until this function finished
 */
export async function getSubmissionsInfo(submissionPage: Page): Promise<SubmissionInfo[]> {
    let tableEle = await submissionPage.$('table.status-frame-datatable > tbody');
    if (tableEle === null) {
        throw new errs.api.EleCFElementNotFound('tableEle in submission page');
    }
    let submissionRowEleList = await tableEle.$$('table.status-frame-datatable > tbody > tr[data-submission-id]');
    // iterate all submission row element
    let submissionInfoList: SubmissionInfo[] = [];
    for (let submissionRowEle of submissionRowEleList) {
        // submission id
        let submissionIdStr = await submissionPage.evaluate(function (ele) {
            return ele.getAttribute('data-submission-id');
        }, submissionRowEle);
        if (submissionIdStr === null) {
            throw new errs.api.EleCFElementNotFound('submissionId in submission row');
        }
        let submissionId: number = parseInt(submissionIdStr, 10);
        // submission time
        let submissionTime = await submissionRowEle.$eval('td:nth-child(2)', function (ele) {
            return ele.innerText;
        });
        // problem fullName
        let problemFullName = await submissionRowEle.$eval('td[data-problemid]', function (ele) {
            return ele.innerText;
        });
        // submission language
        let langName = await submissionRowEle.$eval('td:nth-child(5)', function (ele) {
            return ele.innerText;
        });
        // verdict
        let verdict = await submissionRowEle.$eval('td.status-cell', function (ele) {
            return ele.innerText;
        });
        // time consumed
        let timeConsumed = await submissionRowEle.$eval('td.time-consumed-cell', function (ele) {
            return parseInt(ele.innerText.split(' ')[0], 10);
        });
        // memory consumed
        let memoryConsumed = await submissionRowEle.$eval('td.memory-consumed-cell', function (ele) {
            return parseInt(ele.innerText.split(' ')[0], 10);
        });
        let newSubmissionInfo: SubmissionInfo = {
            submissionId: submissionId,
            time: submissionTime,
            problemFullName: problemFullName,
            langName: langName,
            verdict: verdict,
            timeConsumed: timeConsumed,
            memoryConsumed: memoryConsumed,
        };
        submissionInfoList.push(newSubmissionInfo);
    }
    // return final list result
    return submissionInfoList;
}