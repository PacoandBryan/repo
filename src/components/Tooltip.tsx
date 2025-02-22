import React, { useState, useRef, useEffect } from 'react';

// Add a shared state to track active tooltip
const activeTooltipRef = { current: null };

type TooltipProps = {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
};

export default function Tooltip({ children, content, position = 'top', delay = 0, className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipId = useRef(Math.random().toString());

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Hide other tooltips
    if (activeTooltipRef.current && activeTooltipRef.current !== tooltipId.current) {
      const event = new CustomEvent('hideOtherTooltips', { detail: tooltipId.current });
      window.dispatchEvent(event);
    }
    activeTooltipRef.current = tooltipId.current;
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      if (activeTooltipRef.current === tooltipId.current) {
        activeTooltipRef.current = null;
      }
    }, 1000);
  };

  useEffect(() => {
    const handleHideOthers = (event: CustomEvent) => {
      if (event.detail !== tooltipId.current) {
        setIsVisible(false);
      }
    };

    window.addEventListener('hideOtherTooltips', handleHideOthers as EventListener);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('hideOtherTooltips', handleHideOthers as EventListener);
    };
  }, []);

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={`
            absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded-md whitespace-nowrap
            animate-fade-in
            ${position === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2'}
            ${position === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2'}
            ${position === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-2'}
            ${position === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-2'}
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
} 