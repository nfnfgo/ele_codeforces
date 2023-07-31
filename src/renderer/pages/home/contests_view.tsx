// CSS
import './contest.css';

// Fundamentals
import { useState, useEffect } from 'react';

// Components
import { Center, Container, FlexDiv } from 'renderer/components/container';
import { CFContestCard, CFHistoryContestCard } from 'renderer/components/cf/contest/contest_card';
import { HeadTitle, Title } from 'renderer/components/general/title';
import { CFProblemInfoBlock } from 'renderer/components/cf/contest/problem_info_block';

// Tools
import { classNames } from 'renderer/tools/css_tools';

// Models
import { ContestInfo, HistoryContestInfo } from 'main/api/cf/contests';
import { ProblemDetailedInfo, ProblemInfo, getProblemDetailConfig } from 'main/api/cf/problems';


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
    /**Store the problem id that user selected */
    const [selectedProblemId, setSelectedProblemId] = useState<string | undefined>(undefined);
    const [curProblemDetailedInfo, setCurProblemDetailedInfo] = useState<ProblemDetailedInfo | undefined>(undefined);
    const [loadingProblemDetail, setLoadingProblemDetail] = useState<boolean>(false);

    // Load info for this component
    useEffect(function () {
        if (contestId === undefined) {
            return;
        }
        setLoading(true);
        window.electron.ipcRenderer.invoke('api:cf:getContestProblem', contestId).then(
            function (info) {
                setLoading(false);
                setProblemsInfo(info);
                // Set default selected problem to the first problem
                setSelectedProblemId((info as ProblemInfo[])[0].id);
            }
        );
    }, [contestId]);

    // Load problem detailed info for this compoent everytime selected problem id changed
    useEffect(function () {
        if (selectedProblemId === undefined || contestId === undefined) {
            return;
        }
        setLoadingProblemDetail(true);
        // Construct params
        let funcProp: getProblemDetailConfig = {
            contestId: contestId,
            problemId: selectedProblemId,
        };
        window.electron.ipcRenderer.invoke(
            'api:cf:getProblemDetailedInfo',
            funcProp
        ).then(function (problemDetailedInfo) {
            setCurProblemDetailedInfo(problemDetailedInfo);
        });
        setLoadingProblemDetail(false);
    }, [selectedProblemId]);

    return (
        <FlexDiv className={classNames(
            'relative flex-col',
        )}
            expand={true}>
            <FlexDiv
                className={classNames(
                    'px-2 relative',
                    'flex-col justify-start items-start',
                    'overflow-y-auto',
                    loading ? 'opacity-75' : '',
                )}
                expand={true}>
                {/* Select Problem */}
                <FlexDiv
                    className={classNames(
                        'sticky top-0',
                        'bg-white/[.3] dark:bg-black/[.3]',
                        'backdrop-blur-md',
                        'flex-row gap-x-3',
                        'py-2',
                        'w-full',
                        'relative',
                        'overflow-x-auto',
                    )}>
                    {problemsInfo.map(function (problemInfo) {
                        return (<CFProblemInfoBlock info={problemInfo} />);
                    })}
                </FlexDiv>
                {/* Problem Detailed Info Part */}
                <FlexDiv
                    expand={true}
                    className={classNames(
                        'flex-col justify-start items-start',
                        'py-2',
                    )}>
                    {function () {
                        if (curProblemDetailedInfo === undefined) {
                            return <Center>
                                Problem Detailed Panel
                            </Center>
                        }
                        return (
                            <div id='codeforcesHtmlContent' className={classNames(
                                'flex flex-col flex-auto h-full w-full min-w-0'
                            )}>
                                <Container
                                    className='flex-none min-w-0 w-full'
                                    hasColor={true}>
                                    <div className={classNames(
                                        'flex flex-none flex-col min-w-0 w-full',
                                        'px-2 py-2',
                                        '',
                                    )}>
                                        <div dangerouslySetInnerHTML={{ __html: curProblemDetailedInfo.description }}></div>
                                        <div dangerouslySetInnerHTML={{ __html: curProblemDetailedInfo.inputSpec }}></div>
                                        <div dangerouslySetInnerHTML={{ __html: curProblemDetailedInfo.outputSpec }}></div>
                                        <div dangerouslySetInnerHTML={{ __html: curProblemDetailedInfo.samples }}></div>
                                        <div dangerouslySetInnerHTML={{ __html: curProblemDetailedInfo.note }}></div>
                                    </div>
                                </Container>
                            </div>);
                    }()}
                </FlexDiv>
            </FlexDiv>
        </FlexDiv>
    );
}