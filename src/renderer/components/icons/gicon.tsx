import { classNames } from "renderer/tools/css_tools";

// Components
import { Center, FlexDiv } from 'renderer/components/container';

/**
 * Returns a google icon based on the icon name
 */
export function GoogleIcon({ children, className }: { children: string, className?: string }) {
    return (
        <span className={classNames(
            'material-symbols-rounded',
            className ?? '',
        )}>
            {children}
        </span>
    );
}

export function LoadingSpinningTitle({ children }: { children: React.ReactNode }) {
    return (<Center>
        <FlexDiv className={classNames(
            'h-[2rem] w-[2rem] flex-none',
            'origin-center animate-spin',
            'flex-row justify-center items-center',
        )}>
            <GoogleIcon>progress_activity</GoogleIcon>
        </FlexDiv>
        {children}
    </Center>);
}