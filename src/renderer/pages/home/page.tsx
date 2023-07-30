// Components
import { Container, FlexDiv } from 'components/container';
import { CFTextIcon } from 'components/icons/codeforces';

// Tools
import { classNames } from 'tools/css_tools';

// Apis
import { getContestList } from 'backend/api/contests';


export function HomePage() {
    let contestInfo: string = '';

    getContestList().then(function (value) {
        if (value !== undefined) {
            contestInfo = value;
        }
    });

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
                    {contestInfo}
                </p>
            </FlexDiv>
        </FlexDiv>
    );
}