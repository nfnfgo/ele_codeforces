// Fundamentals
import { useState, useEffect } from 'react';

// Components
import { Container, FlexDiv } from 'renderer/components/container';
import { CFContestCard, CFHistoryContestCard } from 'renderer/components/cf/contest/contest_card';

// Tools
import { classNames } from 'renderer/tools/css_tools';

// Models
import { ContestInfo, HistoryContestInfo } from 'main/api/cf/contests';


export function CFContestsView() {

    let [contestsInfo, setContestsInfo] = useState([]);
    let [hisContestInfo, setHisContestInfo] = useState([]);

    useEffect(function () {
        window.electron.ipcRenderer.invoke('api:cf:getContestList').then(function (value: ContestInfo[]) {
            setContestsInfo(value);
        });
        window.electron.ipcRenderer.invoke('api:cf:getHistoryContestList').then(function (value: HistoryContestInfo[]) {
            setHisContestInfo(value);
        });
    }, []);

    async function refreshInfo() {
        setContestsInfo([]);
        setContestsInfo(await window.electron.ipcRenderer.invoke('api:cf:getContestList'));
    }


    return (
        <FlexDiv
            expand={true}
            className={classNames(
                'flex-row'
            )}>
            <FlexDiv
                id='contestList'
                className={classNames(
                    'flex-col max-w-[40rem]',
                    'flex-auto h-full w-[10rem]',
                    'gap-y-2',
                    'overflow-auto',
                )}>
                <FlexDiv className={classNames(
                    'flex-col',
                    'mx-2'
                )}>
                    <p>Upcoming Round</p>
                    <ul>
                        {contestsInfo.map(function (contestInfo) {
                            return (
                                <li key={contestInfo.name}>
                                    <CFContestCard contestInfo={contestInfo}></CFContestCard>
                                </li>
                            );
                        })}
                    </ul>
                    <p>History Round</p>
                    <ul className={classNames(
                        'flex flex-col gap-y-2',
                    )}>
                        {hisContestInfo.map(function (contestInfo) {
                            return (
                                <li key={contestInfo.name}>
                                    <CFHistoryContestCard contestInfo={contestInfo} />
                                </li>
                            );
                        })}
                    </ul>
                </FlexDiv>
            </FlexDiv>
            <FlexDiv
                id='contestDetailPanel'
                className={classNames(
                    'flex-auto h-full w-[10rem]',
                )}>
                <Container className={classNames(
                    'h-full w-full',
                )}
                    rounded={false}
                    hasColor={false}>
                    <FlexDiv 
                    className={classNames(
                        'flex-col justify-center items-center',
                    )}
                    expand={true}>
                        No Contest Selected
                    </FlexDiv>
                </Container>
            </FlexDiv>
        </FlexDiv>);
}