import React from 'react';

export function BorderBeam({
    className = '',
    size = 200,
    duration = 12,
    borderWidth = 1.5,
    anchor = 90,
    colorFrom = '#00d1ff',
    colorTo = '#0058bc',
    delay = 0
}) {
    return (
        <div
            style={{
                '--size': `${size}px`,
                '--duration': `${duration}s`,
                '--anchor': `${anchor}%`,
                '--border-width': `${borderWidth}px`,
                '--color-from': colorFrom,
                '--color-to': colorTo,
                '--delay': `-${delay}s`
            }}
            className={`border-beam-container ${className}`}
        />
    );
}

export default BorderBeam;
