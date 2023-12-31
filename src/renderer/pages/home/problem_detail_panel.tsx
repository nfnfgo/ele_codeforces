// CSS
import './contest.css';

// Fundamentals
import { useState, useEffect } from 'react';

// Components
import { Center, Container, FlexDiv } from 'renderer/components/container';
import { CFContestCard, CFHistoryContestCard } from 'renderer/components/cf/contest/contest_card';
import { HeadTitle, Title } from 'renderer/components/general/title';
import { CFProblemInfoBlock } from 'renderer/components/cf/contest/problem_info_block';
import { GoogleIcon, LoadingSpinningTitle } from 'renderer/components/icons/gicon';

// Tools
import { classNames } from 'renderer/tools/css_tools';
import { setDefault } from 'general/tools/set_default';

// Models
import { ContestInfo, HistoryContestInfo } from 'main/api/cf/contests';
import { ProblemDetailedInfo, ProblemInfo, getProblemDetailConfig } from 'main/api/cf/problems';

// Stores
import { useContestStateStore } from 'renderer/stores/contestStateStore';



/**
 * Components shows the detailed info of the problem based on the contestId and problemId state
 */
export function ProblemDetailedPanel() {
    // Loading state of this component
    const [loading, setLoading] = useState<boolean>(true);
    // Store the current problem detailed info for this component
    const [curProblemDetailedInfo, setCurProblemDetailedInfo] = useState<ProblemDetailedInfo | undefined>(undefined);

    let contestId = useContestStateStore(state => state.info.contestId);
    let problemId = useContestStateStore(state => state.info.problemId);

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


    if (contestId === undefined) {
        return <></>;
    }


    if (loading === true && curProblemDetailedInfo === undefined) {
        return (
            <LoadingSpinningTitle>Loading...</LoadingSpinningTitle>
        );
    }

    if (curProblemDetailedInfo === undefined) {
        return (<>
            <Center>Failed to load detailed problem info</Center>
        </>);
    }

    return (<>
        <FlexDiv
            expand={true}
            className={classNames(
                'flex-col justify-start items-start',
                'py-2',
                loading ? 'opacity-50' : '',
            )}>
            <div id='codeforcesHtmlContent' className={classNames(
                'flex flex-col flex-auto h-full w-full min-w-0'
            )}>
                <Container
                    className='flex-none min-w-0 w-full select-text'
                    hasColor={true}>
                    <div className={classNames(
                        'flex flex-none flex-col min-w-0 w-full',
                        'px-2 py-2',
                        '',
                    )}>
                        <div dangerouslySetInnerHTML={{ __html: curProblemDetailedInfo.description ?? '' }}></div>
                        <div dangerouslySetInnerHTML={{ __html: curProblemDetailedInfo.inputSpec }}></div>
                        <div dangerouslySetInnerHTML={{ __html: curProblemDetailedInfo.outputSpec }}></div>
                        <div dangerouslySetInnerHTML={{ __html: curProblemDetailedInfo.samples ?? '' }}></div>
                        <div dangerouslySetInnerHTML={{ __html: curProblemDetailedInfo.note ?? '' }}></div>
                    </div>
                </Container>
                <FlexDiv className={classNames(
                    'w-full px-4 py-2',
                    'sticky bottom-[4rem]',
                )}>
                    <ProblemOperationBar
                        contestId={contestId}
                        problemId={problemId!}
                    />
                </FlexDiv>
            </div>
        </FlexDiv>
    </>);
}

/**
 * Operation bar component for user to execute operation about problems 
 * like submit
 * 
 * Usually inside ProblemDetailPanel
 */
function ProblemOperationBar({
    contestId,
    problemId,
}: {
    problemId?: string,
    contestId?: number,
}) {
    let available = true;
    if (problemId === undefined || contestId === undefined) {
        available = false;
    }
    return (
        <Container
            hasColor={false}
            rounded={false}
            className={classNames(
                available ? '' : 'opacity-0 pointer-events-none',
                'transition-all',
                'w-full h-fit',
                'rounded-full',
                'backdrop-blur-lg shadow-lg',
                'bg-white/50 dark:bg-black/50',
            )
            }>
            {/* Buttons Part */}
            <FlexDiv
                expand={true}
                className={classNames(
                    'flex-row justify-end gap-x-2',
                    'py-2 px-2'
                )}>
                {/* Tutorial */}
                <ProblemOptBarButton
                    iconName='collections_bookmark'>
                    Problem Tutorial
                </ProblemOptBarButton>
                {/* Copy Input */}
                <ProblemOptBarButton
                    iconName='content_cut'>
                    Copy Example
                </ProblemOptBarButton>
                {/* Submit Button */}
                <ProblemOptBarButton
                    isPrimary={true}
                    iconName='send'>
                    Clipboard Submit
                </ProblemOptBarButton>
            </FlexDiv>
        </Container>);
}

interface ProblemOptBarButtonConfig {
    /**Callback function when button clicked */
    onClick?: () => (any);
    /**If ture, will set primary style and color for this button */
    isPrimary?: boolean;
    /**The google symbol name of the icon, could be undefined */
    iconName?: string;
    children: React.ReactNode;
}

function ProblemOptBarButton({
    onClick,
    isPrimary,
    iconName,
    children,
}: ProblemOptBarButtonConfig) {
    // set deafault
    onClick = setDefault(onClick, function () { });
    isPrimary = setDefault(isPrimary, false);
    return (<>
        <button onClick={onClick}>
            <Container
                hasColor={false}
                hasHoverColor={true}
                rounded={false}
                className={classNames(
                    isPrimary ? 'bg-primary text-white' : '',
                    'rounded-full',
                )}>
                <FlexDiv className={classNames(
                    'mx-4 my-2',
                    'flex-row justify-center items-center'
                )}>
                    {function () {
                        if (iconName === undefined) {
                            ;
                        }
                        else {
                            return (
                                <GoogleIcon className={classNames(
                                    'mr-2'
                                )}>
                                    {iconName}
                                </GoogleIcon>);
                        }
                    }()}
                    {children}
                </FlexDiv>
            </Container>
        </button>
    </>);
}