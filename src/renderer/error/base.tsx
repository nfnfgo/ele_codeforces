
/**
 * The base error type of Ele Codeforces app
 */
export class EleCFError extends Error {
    constructor(
        title: string,
        msg?: string,
        info?: any) {
        super(`[${title}] ${msg ?? ''}`);
        this.title = title;
        this.msg = msg;
        this.info = info;
    }
    /**
     * Title of this error. E.g.: FormatError
     */
    title: string;
    /**
     * Detail message of this error
     */
    msg?: string;
    /**
     * Additional info of this error
     */
    info: any;
}

class UIError extends EleCFError { }