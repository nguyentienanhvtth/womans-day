'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import MessageBlock from '@/components/MessageBlock';
import AddMessageForm from '@/components/AddMessageForm';
import ChatBox from '@/components/ChatBox';

interface Message {
  id: string;
  content: string;
  color: string;
  author: string;
  row: number;
  col: number;
  created_at: string;
}

const GRID_SIZE = 50;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }
      
      setMessages(data || []);
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, 
        (payload) => {
          setMessages(current => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleBlockClick = useCallback((position: { row: number; col: number }) => {
    const isOccupied = messages.some(
      msg => msg.row === position.row && msg.col === position.col
    );
    
    if (!isOccupied) {
      setSelectedPosition(position);
    }
  }, [messages]);

  const handleSubmit = async (newMessage: Omit<Message, 'id' | 'created_at' | 'row' | 'col'>) => {
    if (!selectedPosition) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            ...newMessage,
            row: selectedPosition.row,
            col: selectedPosition.col,
          }
        ]);

      if (error) {
        if (error.code === '42501') { // Policy violation error
          alert('Bạn đang gửi lời chúc quá nhanh. Vui lòng đợi 30 giây!');
          return;
        }
        throw error;
      }
      setSelectedPosition(null);
    } catch (error) {
      console.error('Error adding message:', error);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại!');
    }
  };

  // Tạo một map các tin nhắn theo vị trí để tìm kiếm nhanh hơn
  const messageMap = useMemo(() => {
    const map = new Map();
    messages.forEach(msg => {
      map.set(`${msg.row}-${msg.col}`, msg);
    });
    return map;
  }, [messages]);

  // Tạo grid một lần và chỉ cập nhật khi messages thay đổi
  const grid = useMemo(() => {
    const cells = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const message = messageMap.get(`${row}-${col}`);
        cells.push(
          <MessageBlock
            key={`${row}-${col}`}
            message={message ? {
              id: message.id,
              content: message.content,
              color: message.color,
              author: message.author
            } : undefined}
            position={{ row, col }}
            onClick={() => handleBlockClick({ row, col })}
          />
        );
      }
    }
    return cells;
  }, [messageMap, handleBlockClick]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-purple-800 mb-8">
          TogetherWeRise - Chào mừng ngày 8/3
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Grid section */}
          <div className="flex-1 min-w-0">
            <div className="text-center mb-4 text-sm text-gray-600">
              Click vào ô trống để thêm lời chúc • Di chuột qua để xem nội dung
            </div>
            <div className="relative w-full bg-white/50 backdrop-blur-sm rounded-lg shadow-lg mb-8 overflow-hidden p-2">
              <div 
                className="grid gap-[1px]"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                  aspectRatio: '1',
                }}
              >
                {grid}
              </div>
            </div>
          </div>

          {/* Chat section */}
          <div className="w-full lg:w-[400px]">
            <ChatBox />
          </div>
        </div>
      </div>

      {selectedPosition && (
        <AddMessageForm
          position={selectedPosition}
          onSubmit={handleSubmit}
          onCancel={() => setSelectedPosition(null)}
        />
      )}
    </div>
  );
}
