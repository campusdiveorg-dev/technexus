import React from 'react';

export function BentoGrid({ children, className = '' }) {
    return (
        <div className={`bento-grid-container ${className}`}>
            {children}
        </div>
    );
}

export function BentoCard({
    icon,
    title,
    description,
    tag,
    badge,
    cta,
    ctaText,
    onCtaClick,
    onClick,
    colSpan = 4,
    theme = 'light',
    className = '',
    style = {},
    background,
    children
}) {
    const colClass = `bento-col-${colSpan}`;
    const themeClass = theme === 'dark' ? 'bento-card-dark' : 'bento-card-frost';
    const finalBadge = badge || tag;
    const finalCta = ctaText || cta;

    return (
        <div 
            onClick={onClick || onCtaClick}
            style={style}
            className={`bento-card ${colClass} ${themeClass} ${onClick || onCtaClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {background && <div className="bento-bg-layer">{background}</div>}
            
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    {icon && <div className="bento-icon">{icon}</div>}
                    {finalBadge && (
                        <span style={{
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            background: theme === 'dark' ? 'rgba(0, 209, 255, 0.15)' : 'rgba(0, 88, 188, 0.1)',
                            color: theme === 'dark' ? '#00D1FF' : 'var(--primary-blue)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(0, 209, 255, 0.3)' : 'rgba(0, 88, 188, 0.2)'}`
                        }}>
                            {finalBadge}
                        </span>
                    )}
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px', lineHeight: 1.3 }}>
                    {title}
                </h3>
                <p style={{ fontSize: '0.95rem', opacity: 0.85, lineHeight: 1.6 }}>
                    {description}
                </p>

                {children}
            </div>

            {finalCta && (
                <div style={{ marginTop: '24px' }}>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        color: theme === 'dark' ? '#00D1FF' : 'var(--primary-blue)'
                    }}>
                        {finalCta} &rarr;
                    </span>
                </div>
            )}
        </div>
    );
}

export default BentoGrid;
