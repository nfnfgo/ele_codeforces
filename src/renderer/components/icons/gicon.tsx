import { classNames } from "renderer/tools/css_tools";

/**
 * Returns a google icon based on the icon name
 */
export function GoogleIcon({ children, className }: { children: string, className?: string }) {
    return (
        <span className={classNames(
            'material-symbols-rounded',
            className
        )}>
            {children}
        </span>
    );
}