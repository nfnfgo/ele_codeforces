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
        // console.log('Browser has been got');
        // (this.browser as Browser).pages().then(function (arr) {
        //     console.log(`Total Page Count: ${arr.length}`)
        //     for (let page of arr) {
        //         console.log(page.url());
        //     }
        // })
        return this.browser;
    }
}