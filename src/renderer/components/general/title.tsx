// Tools
import { classNames } from 'renderer/tools/css_tools';

/**
 * Title component which used for headline or a top of the passage
 */
export function HeadTitle({
    children,
    className,
    hasColor }:
    { children: React.ReactNode, className?: string, hasColor?: boolean }) {
    if (hasColor === undefined) {
        hasColor = false;
    }
    return (<h2 className={classNames(
        'text-2xl font-bold',
        hasColor ? 'bg-bgcolor dark:bg-bgcolor-dark' : '',
        className ?? '',
    )}>{children}</h2>);
}

/**
 * Title component which used for title of a part of the content
 */
export function Title({ children, className }: { children: React.ReactNode, className?: string }) {
    return (<h2 className={classNames(
        'text-xl font-bold',
        className,
    )}>{children}</h2>);
}