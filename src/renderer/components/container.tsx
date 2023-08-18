
// Fundamentals
import React, { CSSProperties } from "react";

// Tools
import { classNames } from "renderer/tools/css_tools";


interface ContainerConfig {
    children: React.ReactNode;
    className?: string;
    hasColor?: boolean;
    hasHoverColor?: boolean;
    hasHoverColorTrans?: boolean;
    hasShadow?: boolean;
    rounded?: boolean;
    expand?: boolean;
    id?: string;
    /**Custom CSS style */
    style?: CSSProperties;
    /**
     * If true, this container will apply the basic selected pattern
     */
    selected?: boolean;
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
    hasHoverColorTrans,
    rounded,
    expand,
    style,
    selected,
    id,
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
    if (hasHoverColorTrans === undefined) {
        hasHoverColorTrans = false;
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
    if (selected === undefined) {
        selected = false;
    }
    if (style === undefined) {
        style = undefined;
    }

    // Container can't have default color when selected
    if (selected === true) {
        hasColor = false;
    }

    return (
        <>
            <div
                id={id}
                className={classNames(
                    'flex min-w-0 min-h-0 overflow-hidden',
                    hasColor ? 'bg-fgcolor dark:bg-fgcolor-dark' : '',
                    selected ? 'bg-primary text-white' : '',
                    hasShadow ? 'shadow-lg' : '',
                    rounded ? 'rounded-lg' : '',
                    expand ? 'h-full w-full' : '',
                    className,
                )}
                style={style as CSSProperties}>
                <div className={classNames(
                    'flex flex-auto h-full w-full min-w-0 min-h-0',
                    hasHoverColor ? 'hover:bg-black/5 dark:hover:bg-white/5' : '',
                    hasHoverColorTrans ? 'transition-colors' : '',
                )}>
                    {children}
                </div>
            </div>
        </>);
}

interface FlexDivConfig {
    id?: string;
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
    style?: CSSProperties,
}

export function FlexDiv({
    children,
    id,
    className,
    expand,
    clearMinLimit,
    style,
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
            <div
                className={classNames(
                    'flex',
                    clearMinLimit ? 'min-h-0 min-w-0' : '',
                    expand ? 'h-full w-full' : '',
                    className,
                )}
                id={id}
                style={style}>
                {children}
            </div>
        </>);
}

/**
 * Center child component at the center of the parent component of this center component
 */
export function Center({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <FlexDiv className={classNames(
            'h-full w-full',
            'flex-row justify-center items-center',
            className ?? '',
        )}>
            {children}
        </FlexDiv>);
}

