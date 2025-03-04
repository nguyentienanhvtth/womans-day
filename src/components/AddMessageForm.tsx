import { useState, memo } from 'react';

interface Message {
  content: string;
  color: string;
  author: string;
}

interface AddMessageFormProps {
  onSubmit: (message: Message) => void;
  position: { row: number; col: number };
  onCancel: () => void;
  existingMessage?: {
    content: string;
    color: string;
    author: string;
  };
}

function AddMessageForm({ onSubmit, position, onCancel, existingMessage }: AddMessageFormProps) {
  const [message, setMessage] = useState(existingMessage?.content || '');
  const [author, setAuthor] = useState(existingMessage?.author || '');
  const [color, setColor] = useState(existingMessage?.color || '#ff69b4');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For editing, we only need color
    if (existingMessage) {
      onSubmit({
        content: existingMessage.content,
        author: existingMessage.author,
        color,
      });
      return;
    }

    // For new messages, we need all fields
    if (!message || !author) return;

    onSubmit({
      content: message,
      author,
      color,
    });
    
    setMessage('');
    setAuthor('');
    onCancel();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onCancel}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-2xl p-4 w-80 animate-fade-in"
      >
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            {existingMessage ? 'Edit message color' : 'Add a greeting'} at position ({position.row}, {position.col})
          </p>
        </div>
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!existingMessage && (
            <>
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                  Your name
                </label>
                <input
                  type="text"
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Your greeting
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  rows={3}
                  required
                />
              </div>
            </>
          )}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Choose color
            </label>
            <input
              type="color"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-8 cursor-pointer rounded"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              {existingMessage ? 'Update color' : 'Send greeting'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default memo(AddMessageForm); 