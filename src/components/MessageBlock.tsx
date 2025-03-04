import { useState, memo } from 'react';

interface MessageBlockProps {
  message?: {
    id: string;
    content: string;
    color: string;
    author: string;
  };
  position?: {
    row: number;
    col: number;
  };
  onClick: () => void;
}

export default memo(function MessageBlock({ message, onClick }: MessageBlockProps) {
  const [showTooltip, setShowTooltip] = useState(false);

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
            ? "cursor-default"
            : "cursor-pointer hover:bg-purple-100 hover:border-1 hover:border-purple-600"
        }`}
        style={{
          backgroundColor: message ? message.color : undefined,
          opacity: message ? 0.5 : undefined,
        }}
      />

      {message && showTooltip && (
        <div className="absolute z-10 w-auto min-w-[200px] max-w-[90vw] sm:max-w-[300px] p-2 sm:p-3 -translate-x-1/2 left-1/2 bottom-[calc(100%+0.5rem)] bg-white rounded-lg shadow-lg text-sm sm:text-base">
          <div className="font-semibold text-purple-600 mb-1">
            {message.author}
          </div>
          <div className="text-gray-700" style={{ color: message.color }}>
            {message.content}
          </div>
          <div className="absolute w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white left-1/2 -translate-x-1/2 -bottom-[6px]" />
        </div>
      )}
    </div>
  );
}); 