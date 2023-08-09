import fs from 'fs';

/**
 * Create a directory with path `dir` if it not exist
 * 
 * Notice:
 * - `dir` must be absolute path
 */
export function createDirIfNotExist(dir: string): undefined {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    };
}

/**
 * Write info into a file, if the file exists, update it
 * 
 * Notice:
 * - New path will be created if the path not exists
 */
export function writeOrUpdateFile(
    path: string,
    data: string | NodeJS.ArrayBufferView
): undefined {
    fs.writeFileSync(path, data, { flag: 'w' });
}