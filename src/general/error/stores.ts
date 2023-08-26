import { EleCFError, EleCFDetailMsgError } from './base';

// Tools
import { setDefault } from 'general/tools/set_default';

export class ReadStorageError extends EleCFDetailMsgError {
    constructor(storageName?: string, err?: Error, info?: any) {
        storageName = setDefault(storageName, 'storage');
        super(
            'ReadStorageError',
            `Error occurred when reading ${storageName} info`,
            err,
            info,
        );
    }
}

export class WriteStorageError extends EleCFDetailMsgError {
    constructor(storageName?: string, err?: Error, info?: any) {
        storageName = setDefault(storageName, 'storage');
        super(
            'WriteStorageError',
            `Error occurred when writing ${storageName} info`,
            err,
            info,
        );
    }
}