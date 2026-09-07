import React from 'react';

export function Marquee({
    children,
    direction = 'left',
    pauseOnHover = true,
    speed = 35,
    className = '',
    style = {}
}) {
    return (
        <div 
            className={`marquee-container ${pauseOnHover ? 'marquee-pause-hover' : ''} ${className}`}
            style={{ ...style, '--speed': `${speed}s` }}
        >
            <div className={`marquee-content ${direction === 'right' ? 'reverse' : ''}`} style={{ animationDuration: `${speed}s` }}>
                {children}
            </div>
            <div className={`marquee-content ${direction === 'right' ? 'reverse' : ''}`} style={{ animationDuration: `${speed}s` }} aria-hidden="true">
                {children}
            </div>
        </div>
    );
}

export default Marquee;
