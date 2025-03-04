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
}

function AddMessageForm({ onSubmit, position, onCancel }: AddMessageFormProps) {
  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [color, setColor] = useState('#ff69b4'); // Default pink color

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            Thêm lời chúc tại vị trí ({position.row}, {position.col})
          </p>
        </div>
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Tên của bạn
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
              Lời chúc của bạn
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
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Chọn màu
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
              Gửi lời chúc
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default memo(AddMessageForm); 