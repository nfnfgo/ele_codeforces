/**
 * Enum of all toast type
 * 
 * Types:
 * - `normal` Just a normal toast with no emphasized type
 * is not need to be emphasized or categoried
 * - `warning` This toast will show some alart or warning info
 * - `error` This toast will show serious error info
 * - `success` This toast will notify user that some actions has been done successfully
 * - `notice` This toast will show some info that need user to specifically noticed on
 */
export enum ToastType {
    notice,
    warning,
    error,
    success,
    normal,
}

export interface ShowToastConfig {
    /**
     * Type of this toast
     * 
     * See docs of `ToastType` for more info
     */
    toastType?: ToastType;
    /**
     * String type msg text which will show in the toast
     */
    msg: string;
    /**
     * Name of the icon which will showed at the left of the toast
     * 
     * Notice:
     * - This iconname must be a valid Google Symbol Name
     * - Default icon will be showed based on `toastType` if not specified an icon name
     */
    gIconName?: string;
}