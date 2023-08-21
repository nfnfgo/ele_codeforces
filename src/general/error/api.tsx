import { EleCFError } from "./base";

// Tools
import { setDefault } from 'general/tools/set_default';

/**
 * Element not found error
 * 
 * Throw this error usually when puppeteer could not found a specified 
 * HTML element in the API process
 * 
 * Params:
 * - `elementName` Name and description of the not found element. E.g.: `loginSelectElement`, 
 * `langSelectElement in submit page`
 */
export class EleCFElementNotFound extends EleCFError {
    constructor(elementName?: string, info?: any) {
        elementName = setDefault(elementName, '');
        super(
            'ElementNotFound',
            `Could not found ${elementName}`,
            info,
        );
    }
}

/**
 * Throw this error when a feature is require a logged in account and 
 * app currently has no available account logged in
 */
export class LoggedInAccountRequired extends EleCFError {
    constructor(detailedInfo?: string, info?: any) {
        let addonInfo: string = '';
        if (detailedInfo === undefined) {
            ;
        } else {
            addonInfo += '\n';
            addonInfo += detailedInfo;
        }
        super(
            'LoggedInAccountRequired',
            'A logged in account required' + addonInfo,
            info,
        );
    }
}