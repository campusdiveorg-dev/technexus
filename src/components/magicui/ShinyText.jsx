import React from 'react';

export function ShinyText({ children, text, className = '', style = {} }) {
    const content = text || children;
    return (
        <span className={`shiny-text ${className}`} style={style}>
            {content}
        </span>
    );
}

export default ShinyText;
