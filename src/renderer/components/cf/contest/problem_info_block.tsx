// Components
import { Container, FlexDiv } from 'renderer/components/container';
import { GoogleIcon } from 'renderer/components/icons/gicon';

// Tools
import { classNames } from 'renderer/tools/css_tools';

// Models
import { ProblemInfo } from 'main/api/cf/problems';

/**
 * Returns a little block that show the basic info of the problem, 
 * usually used as a button for user to select problems
 */
export function CFProblemInfoBlock({ info }: { info: ProblemInfo }) {
    return (
        <Container
            className={classNames(
                'flex-none'
            )}
            hasHoverColor={true}>
            <FlexDiv
                className={classNames(
                    'flex-none flex-col justify-start items-start',
                    'px-2 py-1'
                )}>
                <p className={classNames(
                    'font-semibold text-md'
                )}>{info.id} {info.name}</p>
                <FlexDiv expand={true}
                    className={classNames(
                        'mt-1',
                        'flex-row justify-between',
                        'text-black/50 dark:text-white/50'
                    )}>
                    <div className='flex flex-row items-center'>
                        <GoogleIcon className='text-[18px] mr-1'>schedule</GoogleIcon>
                        <p>{info.limit}</p>
                    </div>
                    <div className='w-5'></div>
                    <div className='flex flex-row items-center'>
                        <GoogleIcon className='text-[18px] mr-1'>sentiment_satisfied</GoogleIcon>
                        <p>{info.solvedCount}</p>
                    </div>
                </FlexDiv>
            </FlexDiv>
        </Container>
    );
}