// Tools
import { classNames } from 'tools/css_tools';

// Components
import { Container, FlexDiv } from 'components/container';

export function CFTextIcon() {
    return (
        <>
            <FlexDiv className={classNames(
                'flex-row justify-center items-center',
                'gap-x-1',
                'font-mono font-semibold'
            )}>
                <Container
                    hasColor={false}
                    className='bg-primary'>
                    <p className={classNames(
                        'px-2',
                        'text-white'
                    )}>Ele</p>
                </Container>
                <p className={classNames(
                    'text-primary'
                )}>Codeforces</p>
            </FlexDiv>
        </>);
}