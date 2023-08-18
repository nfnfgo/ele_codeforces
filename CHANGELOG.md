## Known Issue

## WorkOn

- WorkOn: Disable puppeteer restore pages notification when app started
- WorkOn: Complete problem operation API (e.g.: Submit answer)
- WorkOn: Complete account API and exposers
- WorkOn: Settings page

## 0.1.4

- Update: Use `immer` middleware in contest state management
- Update: Using state management to manage user selected contest and problems
- Fix: Fix the issue that double click contest will cause problem id set to `undefined`
- Fix: Fix the issue that puppeteer may show page restore bubble when app start

## 0.1.3

- Update: Update `cfBrowser` generate logic, avoid async conflict
- Update: Add `puppeteer` user data dir, allow puppeteer to persist state and cookies
- Fix: Remove the import dependency to `renderer/accountStore` in `main` process

## 0.1.2

- Update: Add codeforces login API
- Update: Add `setDefault`
- Update: Enable typescript strict null check

## 0.1.1

- Update: Add `Background` component
- Update: Add account store

## 0.1.0

- Update: Add window management module
- Update: Add settings page
- Update: Add Readme for `EleCFStorage`
- Update: Change config structure of window management module