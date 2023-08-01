

// Fundamentals
import { useLayoutEffect } from 'react';

export function getSystemDarkmodePref(): boolean {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        console.log('Returning true');
        return true;
    }
    return false;
}


// export function useDarkmodeEffect() {
//     let curDarkmode = (new Store()).get('electron.theme.darkmode');
//     if (curDarkmode === undefined) {
//         curDarkmode = getSystemDarkmodePref();
//     }
//     useLayoutEffect(function () {
//         if (curDarkmode === true) {
//             document.documentElement.classList.add('dark');
//         }
//         else {
//             document.documentElement.classList.remove('dark');
//         }
//     }, [curDarkmode]);
// }