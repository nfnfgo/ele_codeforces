// CSS
import './contest.css';

// Fundamentals
import { useState, useEffect } from 'react';

// Components
import { Center, Container, FlexDiv } from 'renderer/components/container';
import { CFContestCard, CFHistoryContestCard } from 'renderer/components/cf/contest/contest_card';
import { HeadTitle, Title } from 'renderer/components/general/title';
import { CFProblemInfoBlock } from 'renderer/components/cf/contest/problem_info_block';
import { ProblemDetailedPanel, ProblemOperationBar } from './problem_detail_panel';
import { GoogleIcon } from 'renderer/components/icons/gicon';

// Tools
import { classNames } from 'renderer/tools/css_tools';

// Models
import { ContestInfo, HistoryContestInfo } from 'general/models/cf/contests';
import { ProblemDetailedInfo, ProblemInfo, getProblemDetailConfig } from 'general/models/cf/problems';

// Stores
import { useContestStateStore, useContestStateStoreConfig, ContestStateData } from 'renderer/stores/contestStateStore';


export function CFContestsView() {

    /**Current contest state info instance */
    let contestsInfo: ContestInfo[] = useContestStateStore(
        (state: useContestStateStoreConfig) => state.info.contestsInfo);
    let historyContestsInfo: HistoryContestInfo[] = useContestStateStore(
        (state: useContestStateStoreConfig) => state.info.historyContestsInfo);
    let hideContestList: boolean = useContestStateStore(
        (state: useContestStateStoreConfig) => state.info.hideContestListUI);
    let contestId = useContestStateStore(
        (state: useContestStateStoreConfig) => state.info.contestId);

    /**Update info in contest state store */
    let updateContestState = useContestStateStore(
        (state: useContestStateStoreConfig) => state.updateState);

    /**Change `hideContestList` state in contest state store */
    let triggerHideContestList = useContestStateStore(
        (state: useContestStateStoreConfig) => state.triggerHideContestList);

    /**Update contest id in contest state */
    let updateContestId = useContestStateStore(
        (state: useContestStateStoreConfig) => state.updateContestId);

    /**Update problem id in contest state */
    let updateProblemId = useContestStateStore(
        (state: useContestStateStoreConfig) => state.updateProblemId);

    // Load contest list when this contest info page first loaded
    useEffect(function () {
        window.electron.ipcRenderer.invoke('api:cf:getContestList').then(function (value: ContestInfo[]) {
            updateContestState(function (state: useContestStateStoreConfig) {
                state.info.contestsInfo = value;
            })
        });
        window.electron.ipcRenderer.invoke('api:cf:getHistoryContestList').then(function (value: HistoryContestInfo[]) {
            updateContestState(function (state: useContestStateStoreConfig) {
                state.info.historyContestsInfo = value;
            });
        });
    }, []);


    return (
        <FlexDiv
            expand={true}
            className={classNames(
                'flex-row relative'
            )}>
            {/* Contest List Part */}
            <FlexDiv
                id='contestList'
                className={classNames(
                    'group/contest-list',
                    'z-[10]',
                    'flex-col',
                    'flex-none h-full w-[22rem]',
                    'gap-y-2',
                    'overflow-auto',
                    hideContestList ? 'absolute left-0' : '',
                    hideContestList ? 'shadow-xl' : '',
                    hideContestList ? 'translate-x-[-19rem] hover:translate-x-[0rem]' : '',
                    hideContestList ? 'opacity-0 hover:opacity-100' : '',
                    hideContestList ? 'backdrop-blur-xl' : '',
                    'transition-all ease-out',
                )}>
                {/* Hide/Show Contest List Button */}
                <FlexDiv className={classNames(
                    hideContestList ? 'sticky ml-[19rem]' : 'absolute left-[19rem]',
                    'top-[0.5rem] z-[100]',
                    'transition-all ease-out'
                )}>
                    <button
                        onClick={function () {
                            triggerHideContestList();
                        }}>
                        <Container
                            className={classNames(
                                'transition-all ease-out',
                                'flex-none h-[2rem] w-[2rem]'
                            )}
                            selected={!hideContestList}>
                            <FlexDiv
                                expand={true}
                                className={classNames(
                                    'flex-row justify-center items-center',
                                )}>
                                <GoogleIcon>
                                    push_pin
                                </GoogleIcon>
                            </FlexDiv>
                        </Container>
                    </button>
                </FlexDiv>
                <FlexDiv className={classNames(
                    'flex-col',
                    'ml-2'
                )}>
                    <div>
                        <HeadTitle className={classNames(
                            'px-1 py-2 backdrop-blur-sm',
                            'sticky top-0'
                        )}
                            hasColor={false}>Upcoming Round</HeadTitle>
                        <ul className={classNames(
                            'flex flex-col gap-y-2',
                        )}>
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
                            'px-1 py-2 backdrop-blur-sm',
                            'sticky top-0'
                        )}
                            hasColor={false}>
                            History Round
                        </HeadTitle>
                        <ul className={classNames(
                            'flex flex-col gap-y-2',
                        )}>
                            {historyContestsInfo.map(function (contestInfo) {
                                return (
                                    <button key={contestInfo.name}
                                        onClick={function () {
                                            updateContestId(contestInfo.contestId);
                                        }}>
                                        <li key={contestInfo.name}>
                                            <CFHistoryContestCard
                                                contestInfo={contestInfo}
                                                selected={contestInfo.contestId === contestId} />
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
                    'flex-auto h-full w-[50rem]',
                )}>
                <CFContestDetailPanel />
            </FlexDiv>
        </FlexDiv >);
}



/**
 * Panel UI of the contest detail info
 */
function CFContestDetailPanel() {
    const [problemsInfo, setProblemsInfo] = useState<ProblemInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    let contestId = useContestStateStore(state => state.info.contestId);
    let problemId = useContestStateStore(state => state.info.problemId);

    let updateProblemId = useContestStateStore(state => state.updateProblemId);

    // Load info for this component
    useEffect(function () {
        if (contestId === undefined) {
            return;
        }
        setLoading(true);
        try {
            // requesting problems list
            window.electron.ipcRenderer.invoke('api:cf:getContestProblem', contestId).then(
                function (info) {
                    setLoading(false);
                    setProblemsInfo(info);
                    // Because this is a new contest, so default to select the first problem
                    updateProblemId((info as ProblemInfo[])[0].id);
                }
            );
        }
        catch (e) {
            setLoading(false);
        }
    }, [contestId]);

    if (contestId === undefined) {
        return <Center>No Contest Selected</Center>;
    }

    return (
        <FlexDiv className={classNames(
            'relative flex-col',
            'w-full',
        )}
            expand={true}>
            <FlexDiv
                className={classNames(
                    'relative',
                    'flex-col justify-start items-start',
                    'overflow-y-auto',
                    loading ? 'opacity-50' : '',
                )}
                expand={true}>
                {/* Select Problem Part*/}
                <FlexDiv
                    className={classNames(
                        'flex-none',
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
                        return (
                            <button
                                className={classNames(
                                    'flex flex-none',
                                )}
                                key={`${problemInfo.contestId}_${problemInfo.id}`}
                                onClick={function () {
                                    updateProblemId(problemInfo.id);
                                }}>
                                <CFProblemInfoBlock
                                    info={problemInfo}
                                    selected={problemInfo.id === problemId}
                                />
                            </button>
                        );
                    })}
                </FlexDiv>
                {/* Problem Detailed Info Part */}
                <ProblemDetailedPanel />

            </FlexDiv>
            {/* Problem Operation Bar Part */}
            <FlexDiv className={classNames(
                'absolute bottom-2 right-2',
            )}>
                <ProblemOperationBar></ProblemOperationBar>
            </FlexDiv>
        </FlexDiv>
    );
}