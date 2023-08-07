// Components
import { useEffect, useState } from 'react';
import { Container, FlexDiv } from 'renderer/components/container';
import { Background } from 'renderer/components/general/background';
import { CFTextIcon } from 'renderer/components/icons/codeforces';
import { GoogleIcon } from 'renderer/components/icons/gicon';

// Page Parts
import { CFContestsView } from './contests_view';

// Tools
import { classNames } from 'renderer/tools/css_tools';
import { Link } from 'react-router-dom';

// Models
import { ContestInfo } from 'main/api/cf/contests';
import { openNewWindowConfig } from 'main/tools/window_opener';

export function HomePage() {

    return (
        <Background className={classNames(
            'flex-col'
        )}>
            {/* Nav Bar */}
            <NavBar></NavBar>
            <FlexDiv
                expand={true}
                className={classNames(
                    'flex-col justify-start items-center',
                )}>
                <CFContestsView></CFContestsView>
            </FlexDiv>
        </Background>
    );
}

/**
 * Navbar component for home page
 */
export function NavBar() {
    return (
        <Container
            id='topNavBar'
            rounded={false}
            className={
                classNames(
                    'flex-none',
                )}>
            <FlexDiv className={classNames(
                'w-full',
                'flex-row justify-between items-center',
                'px-5 py-2'
            )}>
                <div className='text-2xl'>
                    <CFTextIcon />
                </div>
                {/* Settings Button */}
                <button
                    onClick={function () {
                        window.electron.ipcRenderer.invoke('windowmgr:open:settings');
                    }}>
                    <div className={classNames(
                        'flex flex-none justify-center items-center',
                    )}>
                        <GoogleIcon>settings</GoogleIcon>
                    </div>
                </button>
            </FlexDiv>
        </Container>
    );
}