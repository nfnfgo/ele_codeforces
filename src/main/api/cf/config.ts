import puppeteer, { Browser } from 'puppeteer';
import path from 'path';
import { app } from 'electron';

// Tools
import { createDirIfNotExist } from 'general/tools/file';

// Errors
import {} from 'general/error/base';

/**Base URL of Codeforces */
export const baseUrl = 'https://codeforces.com';

/**Contests list URL */
export const contestsUrl = 'contests?complete=true';

export class CFBrowser {
    static browser?: Promise<Browser>;

    /**
     * Return a puppeteer `Browser` instance with singleton mode
     * 
     * Notice:
     * - This method always returns the same `Browser` instance
     */
    static getCfBrowser(): Promise<Browser> {
        if (this.browser === undefined) {
            // get user data dir path
            let userDataDir = path.join(
                app.getPath('userData'),
                'config',
                'browserData',
            );
            createDirIfNotExist(userDataDir);
            // create puppeteer browser
            this.browser = puppeteer.launch({
                headless: "new",
                userDataDir: userDataDir,
            });
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

export interface SupportLangItem {
    /**Number represent the value of the item */
    value: number;
    name: string;
};

export let cfSupportProgramLangList: SupportLangItem[] = [
    { "value": 43, "name": "GNU GCC C11 5.1.0" },
    { "value": 80, "name": "Clang++20 Diagnostics" },
    { "value": 52, "name": "Clang++17 Diagnostics" },
    { "value": 50, "name": "GNU G++14 6.4.0" },
    { "value": 54, "name": "GNU G++17 7.3.0" },
    { "value": 73, "name": "GNU G++20 11.2.0 (64 bit, winlibs)" },
    { "value": 59, "name": "Microsoft Visual C++ 2017" },
    { "value": 61, "name": "GNU G++17 9.2.0 (64 bit, msys 2)" },
    { "value": 65, "name": "C# 8, .NET Core 3.1" },
    { "value": 79, "name": "C# 10, .NET SDK 6.0" },
    { "value": 9, "name": "C# Mono 6.8" },
    { "value": 28, "name": "D DMD32 v2.101.2" },
    { "value": 32, "name": "Go 1.19.5" },
    { "value": 12, "name": "Haskell GHC 8.10.1" },
    { "value": 60, "name": "Java 11.0.6" },
    { "value": 74, "name": "Java 17 64bit" },
    { "value": 36, "name": "Java 1.8.0_241" },
    { "value": 77, "name": "Kotlin 1.6.10" },
    { "value": 83, "name": "Kotlin 1.7.20" },
    { "value": 19, "name": "OCaml 4.02.1" },
    { "value": 3, "name": "Delphi 7" },
    { "value": 4, "name": "Free Pascal 3.0.2" },
    { "value": 51, "name": "PascalABC.NET 3.8.3" },
    { "value": 13, "name": "Perl 5.20.1" },
    { "value": 6, "name": "PHP 8.1.7" },
    { "value": 7, "name": "Python 2.7.18" },
    { "value": 31, "name": "Python 3.8.10" },
    { "value": 40, "name": "PyPy 2.7.13 (7.3.0)" },
    { "value": 41, "name": "PyPy 3.6.9 (7.3.0)" },
    { "value": 70, "name": "PyPy 3.9.10 (7.3.9, 64bit)" },
    { "value": 67, "name": "Ruby 3.0.0" },
    { "value": 75, "name": "Rust 1.66.0 (2021)" },
    { "value": 20, "name": "Scala 2.12.8" },
    { "value": 34, "name": "JavaScript V8 4.8.0" },
    { "value": 55, "name": "Node.js 12.16.3" }]