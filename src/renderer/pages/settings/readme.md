# Settings Pages

Settings page contains all part of settings UI page.

## How it works

First to know: Setting blocks is a UI block that only contains specified part of settings. For example, appearance settings.

To let a settings category appeared in the settings page, we also need to modified `./settings_data.tsx` to add new `SettingsCategoryData` into `settingCategoryList`. This will determine which title and icon will be used to display this category.

Also, in `page.tsx`, we should input all different settings blocks, and put them into one prop `settingsBlockMap`, this links `name` of the category data to an actual React UI block.

## UI/UX Standard

**Settings Block**

Here, settings block refers to the UI block responsible for different type of settings such as "Appearance Settings".

All settings block should nested in a `flex` component which with `px-2 py-2` Tailwind CSS property. *(If not specified, all properties is referred to TailwindCSS properties)*

All settings tile should has `px-2 py-2` property. Using layout preset `SettingTileLayout` in `./settings_tile.tsx` is recommended. Also, if the type of settings tile is usually, should consider package it into a standard settings component such as `SelectionSettingTile`

| Component Name       | Description                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| SettingTileLayout    | To unified the basic layout standard for all types of settings tiles, with basic left-right layout and the standard paddings/margins |
| SelectionSettingTile | Allow user to choose one tile from several different selections                                                                      |
| InputSettingTile     | Allow user to input text value                                                                                                       |
