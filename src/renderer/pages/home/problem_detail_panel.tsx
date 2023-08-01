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


interface ProblemDetailedPanelConfig {
    contestId: number;
    problemId: string;
}

/**
 * Components shows the detailed info of the problem based on the contestId and problemId
 */
export function ProblemDetailedPanel({
    contestId,
    problemId
}: ProblemDetailedPanelConfig) {
    // Loading state of this component
    const [loading, setLoading] = useState<boolean>(true);
    // Store the current problem detailed info for this component
    const [curProblemDetailedInfo, setCurProblemDetailedInfo] = useState<ProblemDetailedInfo | undefined>(undefined);

    // Update problem detailed info once the contestid or problemid changed
    useEffect(function () {
        if (contestId === undefined || problemId === undefined) {
            return;
        }
        setLoading(true);
        try {
            // params
            let funcProp: getProblemDetailConfig = {
                contestId: contestId,
                problemId: problemId,
            };
            // request info
            window.electron.ipcRenderer.invoke(
                'api:cf:getProblemDetailedInfo',
                funcProp
            ).then(function (problemDetailedInfo) {
                setCurProblemDetailedInfo(problemDetailedInfo);
                setLoading(false);
            });
        }
        catch (e) {
            setLoading(false);
        }
    }, [contestId, problemId]);

    return (<>
        <FlexDiv
            expand={true}
            className={classNames(
                'flex-col justify-start items-start',
                'py-2',
                loading ? 'opacity-50' : '',
            )}>
            {function () {
                // if loading === false and current detail info is also false
                // means the data loading process was failed in the useEffect
                if (curProblemDetailedInfo === undefined) {
                    return <Center>
                        Failed to load problem detailed info
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
    </>);
}