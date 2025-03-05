import { useState, memo } from 'react';

// Props interface for the MessageBlock component
interface MessageBlockProps {
  message?: {
    id: string;
    content: string;
    color: string;
    author: string;
  };
  position: {
    row: number;
    col: number;
  };
  onClick: () => void;
}

// Memoized component to prevent unnecessary re-renders
export default memo(function MessageBlock({ message, position, onClick }: MessageBlockProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!position) return {};
    const GRID_SIZE = 50; // Match the grid size from page.tsx
    const isLeftEdge = position.col < 5;
    const isRightEdge = position.col > GRID_SIZE - 5;
    const isTopEdge = position.row < 5;

    let className = "absolute z-10 w-auto min-w-[200px] max-w-[90vw] sm:max-w-[300px] p-2 sm:p-3 ";
    let arrowClassName = "absolute w-0 h-0 ";

    if (isTopEdge) {
      // Show below for top edge blocks
      className += "top-[calc(100%+0.5rem)] ";
      arrowClassName += "border-b-[6px] border-b-white border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent -top-[6px] ";
    } else {
      // Show above for other blocks
      className += "bottom-[calc(100%+0.5rem)] ";
      arrowClassName += "border-t-[6px] border-t-white border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent -bottom-[6px] ";
    }

    if (isLeftEdge) {
      className += "left-0 ";
      arrowClassName += "left-[10%] ";
    } else if (isRightEdge) {
      className += "right-0 ";
      arrowClassName += "right-[10%] ";
    } else {
      className += "-translate-x-1/2 left-1/2 ";
      arrowClassName += "left-1/2 -translate-x-1/2 ";
    }

    return { className, arrowClassName };
  };

  const { className: tooltipClassName, arrowClassName } = getTooltipPosition();

  return (
    <div
      className="relative group aspect-square"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={onClick}
    >
      <div
        className={`w-full h-full transition-colors ${
          message
            ? "cursor-pointer hover:opacity-75 hover:ring-2 hover:ring-purple-400"
            : "cursor-pointer hover:bg-purple-100 hover:border-1 hover:border-purple-600"
        }`}
        style={{
          backgroundColor: message ? message.color : undefined,
          opacity: message ? 0.5 : undefined,
        }}
      />

      {/* Tooltip for displaying message content */}
      {message && showTooltip && (
        <div className={`${tooltipClassName} bg-white rounded-lg shadow-lg text-sm sm:text-base`}>
          <div className="flex justify-between items-start mb-1">
            <div className="font-semibold text-purple-600 text-sm">
              {message.author}
            </div>
            <div className="text-[8px] text-gray-400">
              ({position.row}, {position.col})
            </div>
          </div>
          <div 
            className="text-gray-700 text-sm"
            style={{ color: message.color }}
          >
            {message.content}
          </div>
          <div className={arrowClassName} />
        </div>
      )}
    </div>
  );
}); 