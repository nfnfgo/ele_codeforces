import { ipcMain } from 'electron';

import * as contests from './contests';

ipcMain.handle('api:cf:getContestList', contests.getContestList);