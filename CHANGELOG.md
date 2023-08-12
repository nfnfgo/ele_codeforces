## Known Issue

Event handler of `ipcRenderer.on('windowmgr:signal:refresh')` has triggered 
theme update more than one time in `Background` component, causes unneeded refresh. 
Maybe need to make the same callback be added to the emitter only one time.

## WorkOn

- WorkOn: Complete account API and exposers
- WorkOn: Settings page

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