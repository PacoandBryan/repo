import React, { useState } from 'react';

type TooltipProps = {
  children: React.ReactNode;
  content: string;
  delay?: number;
};

export default function Tooltip({ children, content, delay = 200 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  const showTooltip = () => {
    const timeout = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(timeout);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md 
                      shadow-sm -translate-x-1/2 left-1/2 bottom-full mb-2 whitespace-nowrap">
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 
                        left-1/2 -translate-x-1/2 -bottom-1" />
        </div>
      )}
    </div>
  );
} 