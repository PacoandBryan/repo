import React, { useEffect, useState } from 'react';
import '../styles/CherryBlossomTheme.css';

interface FallingElement {
    id: number;
    left: string;
    delay: string;
    duration: string;
    type: 'sphere' | 'petal';
}

const FallingYarn: React.FC = () => {
    const [elements, setElements] = useState<FallingElement[]>([]);

    useEffect(() => {
        const count = 35;
        const newElements: FallingElement[] = [];
        for (let i = 0; i < count; i++) {
            newElements.push({
                id: i,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 20}s`,
                duration: `${10 + Math.random() * 20}s`,
                type: Math.random() > 0.5 ? 'sphere' : 'petal'
            });
        }
        setElements(newElements);
    }, []);

    return (
        <div className="yarn-container">
            {/* Side Strings */}
            <div className="side-string side-string-left" />
            <div className="side-string side-string-right" />

            {elements.map((el) => (
                <div
                    key={el.id}
                    className={el.type === 'sphere' ? 'low-poly-sphere' : 'blossom-petal'}
                    style={{
                        left: el.left,
                        animation: `sphere-fall ${el.duration} linear ${el.delay} infinite`,
                        opacity: 0.6 + Math.random() * 0.4,
                        transform: `rotate(${Math.random() * 360}deg)`,
                        width: el.type === 'sphere' ? `${16 + Math.random() * 10}px` : `${10 + Math.random() * 8}px`,
                        height: el.type === 'sphere' ? `${16 + Math.random() * 10}px` : `${10 + Math.random() * 8}px`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};

export default FallingYarn;
