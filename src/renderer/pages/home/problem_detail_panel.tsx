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
import { ComboInput } from 'renderer/components/general/combo_input';
import { Transition } from '@headlessui/react';

// Tools
import { classNames } from 'renderer/tools/css_tools';
import { setDefault } from 'general/tools/set_default';

// Models
import { ContestInfo, HistoryContestInfo, getContestSubmissionInfoConfig } from 'general/models/cf/contests';
import { ProblemDetailedInfo, ProblemInfo, getProblemDetailConfig, submitProblemConfig } from 'general/models/cf/problems';
import { cfSupportProgramLangList, SupportLangItem, SubmissionInfo } from 'general/models/codeforces';

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
    let updateContestState = useContestStateStore(state => state.updateState);

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

    // Update contest submission info everytime contest id changed
    useEffect(function () {
        loadingSubmissionInfo();
    }, [contestId]);

    async function loadingSubmissionInfo() {
        try {
            // Do not fetch data when contestId is undefined
            if (contestId === undefined) {
                return;
            }
            // Fetch data
            let props: getContestSubmissionInfoConfig = {
                contestId: contestId,
                checkLogin: true,
            };
            let submissionInfo: SubmissionInfo[] = await window.electron.ipcRenderer.invoke(
                'api:cf:getContestSubmissionInfo',
                props,
            );
            // Update the contest state store
            updateContestState(function (state) {
                state.info.contestSubmissionInfo = submissionInfo;
            });
        } catch (e) {
            ;
        }
    }


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
                    'absolute bottom-[1rem]',
                    'flex-col justify-end items-end',
                )}>
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
export function ProblemOperationBar() {
    let contestId = useContestStateStore(state => state.info.contestId);
    let problemId = useContestStateStore(state => state.info.problemId);

    /**If this operation bar is available now */
    let available = true;
    if (problemId === undefined || contestId === undefined) {
        available = false;
    }

    /**Store hover status of the submit button */
    const [submitButtonHovered, setSubmitButtonHovered] = useState<boolean>(true);

    /**Hanlde callback function when user click `submit from clipboard` button */
    async function handleClipboardSubmit() {
        let debugLangValue = 73; // debug submit language type: G++20 winlibs
        let answerStr = await navigator.clipboard.readText();
        console.log('Debug: Clipboard code got');
        console.log(answerStr);
        let submitProblemProps: submitProblemConfig = {
            contestId: contestId!,
            problemId: problemId!,
            langValue: debugLangValue,
            ansCodeString: answerStr,
        };
        let res = await window.electron.ipcRenderer.invoke(
            'api:cf:submitProblem',
            submitProblemProps,
        );
        console.log('Submit Result: ');
        console.log(res);
    }

    let cancelDishover: NodeJS.Timeout | undefined = undefined;
    /**Handle the hover status changes of the submit button */
    function handleSubmitButtonHoverStatus(isHovered: boolean) {
        if (isHovered === false) {
            cancelDishover = setTimeout(function () {
                setSubmitButtonHovered(false);
            }, 200000);
        }
        else {
            clearTimeout(cancelDishover);
            setSubmitButtonHovered(isHovered);
        }
    }


    return (
        <FlexDiv className={classNames(
            'flex-col gap-y-2 justify-end items-end',
        )}>
            {/* Submission Block Part */}
            <Transition
                show={submitButtonHovered}
                enter="transition-all duration-100"
                enterFrom="opacity-0 scale-75"
                enterTo="opacity-100 scale-100"
                leave="transition-all duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-75"
                className={classNames(
                    'origin-bottom-right'
                )}>
                <ClipboardSubmitHoverBlock handleHoverStatus={handleSubmitButtonHoverStatus}></ClipboardSubmitHoverBlock>
            </Transition>
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
                    'overflow-visible',
                )
                }>
                {/* Operation Bar Root Div Part */}
                <FlexDiv
                    expand={true}
                    className={classNames(
                        'flex-row justify-between gap-x-2',
                        'py-2 px-2'
                    )}>
                    {/* Submission Status Bar */}
                    <FlexDiv className={classNames(
                        'rounded-full'
                    )}>
                    </FlexDiv>
                    {/* Buttons Part */}
                    <FlexDiv className={classNames(
                        'flex-row gap-x-2',
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
                            onClick={handleClipboardSubmit}
                            isPrimary={true}
                            iconName='send'
                            onHoverChanged={handleSubmitButtonHoverStatus}>
                            Clipboard Submit
                        </ProblemOptBarButton>
                    </FlexDiv>
                </FlexDiv>
            </Container>
        </FlexDiv>
    );
}

interface ProblemOptBarButtonConfig {
    /**Callback function when button clicked */
    onClick?: () => (any);
    /**
     * Callback function when hover state changed 
     *
     * Notice:
     * - This callback function could receive a param `isHovered`, indicates 
     * the current hover state
     */
    onHoverChanged?: (isHovered: boolean) => (any);
    /**If ture, will set primary style and color for this button */
    isPrimary?: boolean;
    /**The google symbol name of the icon, could be undefined */
    iconName?: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * Button component used in the problem opt bar
 */
function ProblemOptBarButton({
    onClick,
    isPrimary,
    iconName,
    onHoverChanged,
    className,
    children,
}: ProblemOptBarButtonConfig) {
    // set deafault
    onClick = setDefault(onClick, function () { });
    onHoverChanged = setDefault(onHoverChanged, function () { });
    isPrimary = setDefault(isPrimary, false);
    return (<>
        <button
            onClick={onClick}
            onMouseEnter={function () {
                onHoverChanged!(true);
            }}
            onMouseLeave={function () {
                onHoverChanged!(false);
            }}
            className={classNames(
                className ?? '',
            )}>
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

/**
 * Hover block component showed when hover on `clipboard submit` button
 */
function ClipboardSubmitHoverBlock({
    handleHoverStatus,
}: {
    handleHoverStatus: (isHovered: boolean) => any;
}) {
    let contestId = useContestStateStore(state => state.info.contestId);
    let problemId = useContestStateStore(state => state.info.problemId);

    const [clipboardText, setClipboardText] = useState('No Clipboard Text Detected');

    useEffect(function () {
        try {
            navigator.clipboard.readText().then(function (text) {
                console.log(text);
                setClipboardText(text);
            }).catch(function (e) {
                setClipboardText('Please focus app window to allow app reading clipboard');
            });
        } catch (e) {
            setClipboardText('Please focus app window to allow app reading clipboard');
        }
    }, []);

    function handleQueryFilter(queryString: string, curLangData: SupportLangItem) {
        let includeName = curLangData.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(
                queryString.toLowerCase().replace(/\s+/g, '')
            );
        let includeValue = curLangData.value
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(
                queryString.toLowerCase().replace(/\s+/g, '')
            );
        return includeName || includeValue;
    };

    return (
        <div onMouseEnter={function () {
            handleHoverStatus(true);
        }}
            onMouseLeave={function () {
                handleHoverStatus(false);
            }}>
            <Container
                hasShadow={true}
                className='overflow-visible'>
                <FlexDiv className={classNames(
                    'mx-2 my-2 z-[10]',
                    'flex-col gap-y-2',
                    'overflow-visible',
                )}>
                    {/* Title Part */}
                    <p className={classNames(
                        'font-semibold',
                    )}>
                        Submit Code From Clipboard
                    </p>
                    <Container hasColor={false}>
                        <pre className={classNames(
                            'max-w-[20rem] max-h-[10rem] overflow-auto',
                            'bg-black/5 dark:bg-white/5',
                        )}>
                            {clipboardText ?? 'No clipboard text'}
                        </pre>
                    </Container>
                    <button>
                        <Container
                            hasColor={false}
                            className={classNames(
                                'overflow-visible',
                            )}>
                            <FlexDiv className={classNames(
                                'w-full',
                                'overflow-visible',
                            )}>
                                {/* Language Selection Part */}
                                <ComboInput
                                    data={cfSupportProgramLangList}
                                    initValue={cfSupportProgramLangList[5]}
                                    queryFilter={handleQueryFilter}
                                    getDataTitle={function (langItem) {
                                        return langItem.name;
                                    }}
                                    vertical='top'
                                    horizonal='left'
                                    buttonColorClassName='bg-black/5 dark:bg-white/5'
                                    dropdownColorClassName='bg-fgcolor dark:bg-fgcolor-dark' />
                            </FlexDiv>
                        </Container>
                    </button>
                </FlexDiv>
            </Container>
        </div>
    );
}