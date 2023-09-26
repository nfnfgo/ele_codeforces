# Settings Pages

Settings page contains all part of settings UI page.

## How it works

First to know: Setting blocks is a UI block that only contains specified part of settings. For example, appearance settings.

To let a settings category appeared in the settings page, we also need to modified `./settings_data.tsx` to add new `SettingsCategoryData` into `settingCategoryList`. This will determine which title and icon will be used to display this category.

Also, in `page.tsx`, we should input all different settings blocks, and put them into one prop `settingsBlockMap`, this links `name` of the category data to an actual React UI block.