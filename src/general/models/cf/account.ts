
export interface logInCfAccountConfig {
    account: string;
    password: string;
    /**
     * If `true`, send refresh signal to all app page after a successful login, including `mainWindow`
     */
    triggerRefresh?: boolean;
    /**
     * If `true`, update `accountInfo` storage after a successful login
     */
    updateStorage?: boolean;
}