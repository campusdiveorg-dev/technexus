import React from 'react';

export function ShimmerButton({
    children,
    onClick,
    type = 'button',
    disabled = false,
    className = '',
    style = {},
    shimmerColor = '#00d1ff',
    variant = 'primary',
    size = 'md'
}) {
    const variantClass = variant === 'electric' 
        ? 'shimmer-button-electric' 
        : variant === 'dark' 
        ? 'shimmer-button-dark' 
        : variant === 'outline'
        ? 'shimmer-button-outline'
        : 'shimmer-button-primary';

    const sizeClass = size === 'sm' 
        ? 'shimmer-button-sm' 
        : size === 'lg' 
        ? 'shimmer-button-lg' 
        : 'shimmer-button-md';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={style}
            className={`shimmer-button ${variantClass} ${sizeClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            <span className="shimmer-highlight" style={{ '--shimmer-color': shimmerColor }}></span>
            <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {children}
            </span>
        </button>
    );
}

export default ShimmerButton;
