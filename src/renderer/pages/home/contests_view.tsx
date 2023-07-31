// Fundamentals
import { useState, useEffect } from 'react';

// Components
import { Center, Container, FlexDiv } from 'renderer/components/container';
import { CFContestCard, CFHistoryContestCard } from 'renderer/components/cf/contest/contest_card';
import { HeadTitle, Title } from 'renderer/components/general/title';

// Tools
import { classNames } from 'renderer/tools/css_tools';

// Models
import { ContestInfo, HistoryContestInfo } from 'main/api/cf/contests';
import { ProblemInfo } from 'main/api/cf/problems';
import { CFProblemInfoBlock } from 'renderer/components/cf/contest/problem_info_block';


export function CFContestsView() {

    let [contestsInfo, setContestsInfo] = useState([]);
    let [hisContestInfo, setHisContestInfo] = useState([]);
    // Store the contest id which user manually selected
    let [selectedContestId, setSelectedContestId] = useState<number | undefined>(undefined);

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
                'flex-row relative'
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
                    <div>
                        <HeadTitle className={classNames(
                            'px-1 py-2',
                            'sticky top-0'
                        )}
                            hasColor={true}>Upcoming Round</HeadTitle>
                        <ul>
                            {contestsInfo.map(function (contestInfo) {
                                return (
                                    <li key={contestInfo.name}>
                                        <CFContestCard contestInfo={contestInfo}></CFContestCard>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div>
                        <HeadTitle className={classNames(
                            'px-1 py-2',
                            'sticky top-0'
                        )}
                            hasColor={true}>History Round</HeadTitle>
                        <ul className={classNames(
                            'flex flex-col gap-y-2',
                        )}>
                            {hisContestInfo.map(function (contestInfo) {
                                return (
                                    <button key={contestInfo.name}
                                        onClick={function () {
                                            setSelectedContestId(contestInfo.contestId);
                                        }}>
                                        <li key={contestInfo.name}>
                                            <CFHistoryContestCard
                                                contestInfo={contestInfo}
                                                selected={contestInfo.contestId === selectedContestId} />
                                        </li>
                                    </button>
                                );
                            })}
                        </ul>
                    </div>
                </FlexDiv>
            </FlexDiv>
            {/* Detail Info About The Contest */}
            <FlexDiv
                id='contestDetailPanel'
                className={classNames(
                    'flex-auto h-full w-[15rem]',
                )}>
                {function () {
                    if (selectedContestId === undefined) {
                        return <Center>No Contest Selected</Center>
                    }
                    return (<CFContestDetailPanel
                        contestId={selectedContestId}
                    />);
                }()}
            </FlexDiv>
        </FlexDiv>);
}



/**
 * Panel UI of the contest detail info
 */
function CFContestDetailPanel({ contestId }: { contestId: number }) {
    const [problemsInfo, setProblemsInfo] = useState<ProblemInfo[]>([]);

    const [loading, setLoading] = useState<boolean>(false);

    useEffect(function () {
        setLoading(true);
        window.electron.ipcRenderer.invoke('api:cf:getContestProblem', contestId).then(
            function (info) {
                setLoading(false);
                setProblemsInfo(info);
            }
        );
    }, [contestId]);

    return (
        <FlexDiv
            className={classNames(
                'px-2',
                'flex-col justify-start items-start',
                'overflow-hidden',
                loading ? 'opacity-75' : '',
            )}
            expand={true}>
            <FlexDiv
                className={classNames(
                    'flex-row gap-x-3',
                    'py-2',
                    'w-full',
                    'overflow-x-auto',
                )}>
                {problemsInfo.map(function (problemInfo) {
                    return (<CFProblemInfoBlock info={problemInfo} />);
                })}
            </FlexDiv>
        </FlexDiv>
    );
}