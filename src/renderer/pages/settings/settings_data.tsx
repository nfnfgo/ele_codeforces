
export class SettingsCategoryData {
    constructor(iconName: string, title: string) {
        this.iconName = iconName;
        this.title = title;
    }
    iconName: string;
    title: string;
}

export let settingCategoryList: SettingsCategoryData[] = [
    new SettingsCategoryData('palette', 'Appearance'),
    new SettingsCategoryData('settings', 'General'),
    new SettingsCategoryData('account_circle', 'Account'),
    new SettingsCategoryData('info', 'About'),
];