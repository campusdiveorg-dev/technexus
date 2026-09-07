import React from 'react';

export function DotPattern({
    width = 24,
    height = 24,
    x = 0,
    y = 0,
    cx = 1,
    cy = 1,
    cr = 1,
    opacity = 0.35,
    className = '',
    style = {}
}) {
    const id = React.useId();

    return (
        <svg
            aria-hidden="true"
            className={`dot-pattern ${className}`}
            style={{ ...style, opacity }}
        >
            <defs>
                <pattern
                    id={id}
                    width={width}
                    height={height}
                    patternUnits="userSpaceOnUse"
                    patternContentUnits="userSpaceOnUse"
                    x={x}
                    y={y}
                >
                    <circle id="pattern-circle" cx={cx} cy={cy} r={cr} fill="currentColor" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
        </svg>
    );
}

export default DotPattern;
