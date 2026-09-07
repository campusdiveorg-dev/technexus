import React, { useEffect, useState } from 'react';

export function NumberTicker({ value = 0, target = 0, duration = 1500, prefix = '', suffix = '', className = '' }) {
    const [count, setCount] = useState(0);
    const finalTarget = target || value;

    useEffect(() => {
        const numTarget = typeof finalTarget === 'number' ? finalTarget : parseFloat(finalTarget) || 0;
        if (numTarget === 0) {
            setCount(0);
            return;
        }

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeProgress * numTarget);
            setCount(current);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setCount(numTarget);
            }
        };

        const animId = window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(animId);
    }, [finalTarget, duration]);

    return (
        <span className={`number-ticker ${className}`}>
            {prefix}{count.toLocaleString('en-KE')}{suffix}
        </span>
    );
}

export default NumberTicker;
