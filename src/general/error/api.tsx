import { EleCFError } from "./base";

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