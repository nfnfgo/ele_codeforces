// Components
import { useEffect, useState } from 'react';
import { Container, FlexDiv } from 'renderer/components/container';
import { CFTextIcon } from 'renderer/components/icons/codeforces';

// Tools
import { classNames } from 'renderer/tools/css_tools';

// Models
import { ContestInfo } from 'main/api/cf/contests';

export function HomePage() {
    let [contestsStringInfo, setContestsStringInfo] = useState('Loading...');
    useEffect(function () {
        window.electron.ipcRenderer.invoke('api:cf:getContestList').then(function (value: ContestInfo[]) {
            setContestsStringInfo(value[0].name);
        });
    }, []);

    async function refreshInfo() {
        setContestsStringInfo('Refreshing...');
        setContestsStringInfo(await window.electron.ipcRenderer.invoke('api:cf:getContestList'));
    }


    return (
        <FlexDiv
            className={classNames(
                'flex-col'
            )}
            expand={true}>
            <Container
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
                    <p>Account</p>
                </FlexDiv>
            </Container>
            <FlexDiv
                expand={true}
                className={classNames(
                    'flex-col justify-center items-start'
                )}>
                <p>
                    {contestsStringInfo}
                </p>
                <button onClick={refreshInfo}>
                    Refresh
                </button>
            </FlexDiv>
        </FlexDiv>
    );
}