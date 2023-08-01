import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { ipcMain } from 'electron';

// errors
import * as errs from 'general/error/base';

export interface EleCFStorageConfig {
    storageName?: string;
    defaultValue?: any;
}

/**
 * Custom persist storage class
 */
class EleCFStorage {
    constructor({
        storageName,
        defaultValue,
    }:
        EleCFStorageConfig) {
        // set default value
        if (storageName === undefined) {
            storageName = 'eleCfConfig';
        }
        if (defaultValue === undefined) {
            defaultValue = {};
        }
        // adopted default value
        this.storageName = storageName;
        this.jsonInfo = defaultValue;
        // update info from storage (if have)
        let jsonFilePath = path.join(
            app.getPath('userData'),
            'config',
            `${storageName}.json`,
        );
        try {
            this.jsonInfo = JSON.parse(
                fs.readFileSync(jsonFilePath).toString()
            );
        } catch (e) {
            ;
        }
    }
    /**The name used as the name of the json file when storage info of this class */
    storageName: string;
    /**Json info of this config file */
    jsonInfo: any;

    /**
     * Register methods to the ipcMain 
     * 
     * Notice:
     * - The method should only be called in electron main process env
     * */
    addIpcMainHandler(channelPrefix?: string): void {
        if (channelPrefix === undefined) {
            channelPrefix = `storage:${this.storageName}`;
        }
        // expose getInfo method
        let getInfo = this.getInfo();
        function getInfoHandler(event, propName: string) {
            return getInfo(propName);
        }
        ipcMain.handle(`${channelPrefix}:get`, getInfoHandler);
    }

    /**Get info of this storage 
     * 
     * Notice:
     * - If propName undefined, return whole info 
     * - If the specified propName doesn't exist, return `undefined`
     * 
     * E.g.:
     * - `get()` Return complete info
     * - `get('theme.darkmode')` Return `jsoninfo.theme.darkmode`
     * - `get('this.is.an.undefined.path')` Return `undefined`
     */
    getInfo(propName?: string) {
        // if propName undefined, return whole info
        if (propName === undefined) {
            return this.jsonInfo;
        }
        // else, return specified param
        try {
            let propNameList: string[] = propName.split('.');
            let curProp = this.jsonInfo;
            for (let curPropName of propNameList) {
                curProp = curProp[curPropName];
                // if meet undefined value, return undefined
                if (curProp === undefined) {
                    return undefined;
                }
            }
            return curProp;
        } catch (e) {
            throw new errs.EleCFError(
                'StorageInfoReadError',
                `Could not read info with propName ${propName}\n` +
                `Detailed error message: \n` +
                `storageName:${this.storageName}\n` +
                `jsonInfo: ${this.jsonInfo}`
            );
        }
    }
}