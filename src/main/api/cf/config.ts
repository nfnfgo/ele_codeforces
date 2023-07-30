import puppeteer, { Browser } from 'puppeteer';

/**Base URL of Codeforces */
export const baseUrl = 'https://codeforces.com';

/**Contests list URL */
export const contestsUrl = 'contests';

export class CFBrowser {
    static browser;

    static async getCfBrowser(): Promise<Browser> {
        if (this.browser === undefined) {
            this.browser = await puppeteer.launch({ headless: "new" });
        }
        return this.browser;
    }
}