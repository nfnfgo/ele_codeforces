// Components
import { useEffect, useState } from 'react';
import { Container, FlexDiv } from 'renderer/components/container';
import { CFTextIcon } from 'renderer/components/icons/codeforces';

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
        <div className={classNames(
            'flex',
            'h-screen w-screen',
            'text-black dark:text-white',
        )}>
            <FlexDiv
                className={classNames(
                    'flex-col',
                    'bg-bgcolor dark:bg-bgcolor-dark'
                )}
                expand={true}>
                {/* Nav Bar */}
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
                        <button
                            onClick={function () {
                                let param: openNewWindowConfig = {
                                    url: '/contest',
                                    isFullUrl: false,
                                };
                                console.log('Contact ipcMain to open new window');
                                window.electron.ipcRenderer.invoke('windowopt:open', param);
                            }}>
                            Window.open
                        </button>
                        <Link to='/contest' target=''>LinkTo</Link>
                        <Link to='contest' target='_blank'>LinkTo_blank</Link>
                        <a href='/contest' target=''>aHref</a>
                        <a href='/contest' target='_blank'>aHref_blank</a>
                    </FlexDiv>
                </Container>
                <FlexDiv
                    expand={true}
                    className={classNames(
                        'flex-col justify-start items-center',
                    )}>
                    <CFContestsView></CFContestsView>
                </FlexDiv>
            </FlexDiv >
        </div >
    );
}