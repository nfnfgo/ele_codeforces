import { ipcMain } from 'electron';

import * as contests from './contests';
import * as problems from './problems';
import * as account from './account';

ipcMain.handle('api:cf:getContestList', contests.getContestList);
ipcMain.handle('api:cf:getHistoryContestList', contests.getHistoryContestInfo);
ipcMain.handle('api:cf:getContestProblem', async function (event, contestId) {
    return await problems.getContestProblems(contestId);
});
ipcMain.handle('api:cf:getProblemDetailedInfo', async function (event, prop) {
    return await problems.getProblemDetailedInfo(prop);
});
// Account
ipcMain.handle('api:cf:logInCfAccount', async function (event, prop: account.logInCfAccountConfig) {
    let accountInfo = await account.logInCfAccount(prop);
    return accountInfo;
});