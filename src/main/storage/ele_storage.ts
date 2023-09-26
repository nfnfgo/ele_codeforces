import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { ipcMain } from 'electron';

// Tools
import { setDefault } from 'general/tools/set_default';
import * as file from 'general/tools/file';

// errors
import * as errs from 'general/error/base';

export interface EleCFStorageConfig {
    /**
     * Name used for the storage file and the ipcMain channel name (if choose to expose)
     */
    storageName?: string;
    defaultValue?: any;
    /**
     * If ture, the setInfo and getInfo method will be add to ipcMain handler
     * 
     * For more info, check `this.addIpcMainHandler()`
     * */
    exposeToIpcMain?: boolean;
}

/**
 * Custom persist storage class
 */
export class EleCFStorage {
    constructor({
        storageName,
        defaultValue,
        exposeToIpcMain,
    }: EleCFStorageConfig) {
        // set default value
        if (storageName === undefined) {
            storageName = 'eleCfConfig';
        }
        if (defaultValue === undefined) {
            defaultValue = {};
        }
        if (exposeToIpcMain === undefined) {
            exposeToIpcMain = true;
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
        // expose to ipcMain if needed
        if (exposeToIpcMain === true) {
            this.addIpcMainHandler();
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
        let self = this;
        if (channelPrefix === undefined) {
            channelPrefix = `storage:${this.storageName}`;
        }
        // expose getInfo method
        function getInfoHandler(event, propName: string) {
            return self.getInfo(propName);
        }
        ipcMain.handle(`${channelPrefix}:getInfo`, getInfoHandler);
        // expose setInfo method
        function setInfoHandler(event, propName, info) {
            return self.setInfo(propName, info);
        }
        ipcMain.handle(`${channelPrefix}:setInfo`, setInfoHandler);
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
                // if meet undefined value, return undefined
                if (curProp === undefined) {
                    return undefined;
                }
                curProp = curProp[curPropName];
            }
            return curProp;
        } catch (e) {
            throw new errs.EleCFError(
                'StorageInfoReadError',
                `Could not read info with propName ${propName}\n` +
                `Detailed error message: \n` +
                `storageName:${this.storageName}\n` +
                `jsonInfo: ${this.jsonInfo}` +
                `Error info: ${e}`
            );
        }
    }

    /**
     * Set info of this storage
     * 
     * Notice:
     * - Do NOT pass uncheck or unsecure params to info, since 
     * this method use `eval()` to add info to the storage jsonInfo
     */
    setInfo(propName: string, info: any, writeToStorage?: boolean) {
        // set default
        writeToStorage = setDefault(writeToStorage, true);
        try {// reach the propName
            let propList = propName.split('.');
            let curPropName = `this.jsonInfo`;
            for (let propName of propList) {
                curPropName = `${curPropName}.${propName}`;
                let res = eval(curPropName);
                if (res === undefined) {
                    eval(`${curPropName} = {}`);
                }
            }
            eval(`${curPropName} = ${JSON.stringify(info)}`);
            if (writeToStorage === true) {
                let jsonFileDirPath = path.join(
                    app.getPath('userData'),
                    'config',
                );
                let jsonFilePath = path.join(
                    app.getPath('userData'),
                    'config',
                    `${this.storageName}.json`,
                );
                file.createDirIfNotExist(jsonFileDirPath);
                file.writeOrUpdateFile(jsonFilePath, JSON.stringify(this.jsonInfo));
            }
        } catch (e) {
            throw new errs.EleCFError(
                'StorageInfoWriteError',
                `Could not write info with propName ${propName}\n` +
                `Detailed error message: \n` +
                `storageName:${this.storageName}\n` +
                `jsonInfo: ${this.jsonInfo}` +
                `Error info: ${e}`
            );
        }
    }
}