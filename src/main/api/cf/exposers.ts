import { ipcMain } from 'electron';

import * as contests from './contests';
import * as problems from './problems';
import * as account from './account';

// Contests
ipcMain.handle('api:cf:getContestList', async function () {
    return await contests.getContestList();
});
ipcMain.handle('api:cf:getHistoryContestList', async function () {
    return await contests.getHistoryContestInfo();
});
ipcMain.handle('api:cf:getContestSubmissionInfo', async function (event, props) {
    return await contests.getContestSubmissionInfo(props);
});
// Account
ipcMain.handle('api:cf:logInCfAccount', async function (event, prop) {
    let accountInfo = await account.logInCfAccount(prop);
    return accountInfo;
});

// Problems
ipcMain.handle('api:cf:getContestProblem', async function (event, contestId) {
    return await problems.getContestProblems(contestId);
});
ipcMain.handle('api:cf:getProblemDetailedInfo', async function (event, prop) {
    return await problems.getProblemDetailedInfo(prop);
});
ipcMain.handle('api:cf:submitProblem', async function (event, prop) {
    return await problems.submitProblem(prop);
});