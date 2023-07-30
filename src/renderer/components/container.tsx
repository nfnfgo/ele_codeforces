
// Fundamentals
import React from "react";

// Tools
import { classNames } from "tools/css_tools";


interface ContainerConfig {
    children: React.ReactNode;
    className?: string;
    hasColor?: boolean,
    hasHoverColor?: boolean,
    hasShadow?: boolean,
    rounded?: boolean,
    expand?: boolean,
}

/**
 * The default container style flex component
 * 
 * Notice:
 * - Do NOT try to pass padding style in classNames param, instead, using a 
 * margin at the element that directly inside this Container
 */
export function Container({
    children,
    className,
    hasColor,
    hasShadow,
    hasHoverColor,
    rounded,
    expand,
}: ContainerConfig) {
    // Classname default to empty string
    if (className === undefined) {
        className = '';
    }
    // hasColor default to true
    if (hasColor === undefined) {
        hasColor = true;
    }
    // hasHoverColor default to false
    if (hasHoverColor === undefined) {
        hasHoverColor = false;
    }
    if (hasShadow === undefined) {
        hasShadow = false;
    }
    // rounded default to true
    if (rounded === undefined) {
        rounded = true;
    }
    // expand default to false
    if (expand === undefined) {
        expand = false;
    }

    return (
        <>
            <div
                className={classNames(
                    'flex min-w-0 min-h-0 overflow-hidden',
                    hasColor ? 'bg-fgcolor dark:bg-fgcolor-dark' : '',
                    hasShadow ? 'shadow-lg' : '',
                    rounded ? 'rounded-lg' : '',
                    expand ? 'h-full w-full' : '',
                    className,
                )}>
                <div className={classNames(
                    'flex flex-auto h-full w-full min-w-0 min-h-0',
                    hasHoverColor ? 'hover:bg-black/5 dark:hover:bg-white/5 transition-colors' : '',
                )}>
                    {children}
                </div>
            </div>
        </>);
}

interface FlexDivConfig {
    children?: React.ReactNode,
    className?: string,
    /**
     * Expand width and height of this flex div to fit to the parent max size
     * 
     * TailwindCSS: `h-full` `w-full`
     */
    expand?: boolean,
    /**
     * Clear minimum width and height limit, recommend to set this param to `true`
     * 
     * Notice:
     * - If the `min-h` and `min-w` are not cleared for a flex div, the div may ignoring 
     * the height and width limit of it's parent and acted as an overflow content
     */
    clearMinLimit?: boolean,
}

export function FlexDiv({
    children,
    className,
    expand,
    clearMinLimit,
}: FlexDivConfig) {
    if (className === undefined) {
        className = '';
    }
    // Default expaned to false
    if (expand === undefined) {
        expand = false;
    }
    // Default clearMinLimit to true
    if (clearMinLimit === undefined) {
        clearMinLimit = true;
    }

    return (
        <>
            <div className={classNames(
                'flex',
                clearMinLimit ? 'min-h-0 min-w-0' : '',
                expand ? 'h-full w-full' : '',
                className,
            )}>
                {children}
            </div>
        </>);
}