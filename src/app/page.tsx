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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
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
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          setMessages(current =>
            current.map(msg =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleBlockClick = useCallback((position: { row: number; col: number }) => {
    const existingMessage = messages.find(
      msg => msg.row === position.row && msg.col === position.col
    );
    
    if (existingMessage) {
      setSelectedMessage(existingMessage);
      setSelectedPosition({ row: position.row, col: position.col });
    } else {
      setSelectedMessage(null);
      setSelectedPosition(position);
    }
  }, [messages]);

  const handleSubmit = async (newMessage: Omit<Message, 'id' | 'created_at' | 'row' | 'col'>) => {
    if (!selectedPosition) return;

    try {
      if (selectedMessage) {
        // Update existing message
        const { data, error } = await supabase
          .from('messages')
          .update({
            author: newMessage.author,
            content: newMessage.content,
            color: newMessage.color
          })
          .eq('id', selectedMessage.id)
          .select()
          .single();

        if (error) {
          if (error.code === '42501') {
            alert('You are sending updates too fast. Please wait 30 seconds!');
            return;
          }
          console.error('Update error:', error);
          throw error;
        }

        // Update local state immediately for better UX
        if (data) {
          setMessages(current =>
            current.map(msg =>
              msg.id === selectedMessage.id ? data : msg
            )
          );
          alert('Message updated successfully!');
        }
      } else {
        // Insert new message
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
          if (error.code === '42501') {
            alert('You are sending a greeting too fast. Please wait 30 seconds!');
            return;
          }
          throw error;
        }
        alert('Message added successfully!');
      }
      setSelectedPosition(null);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error with message:', error);
      alert('Cannot perform the action. Please try again!');
    }
  };

  // Create a message map for faster lookups
  const messageMap = useMemo(() => {
    const map = new Map();
    messages.forEach(msg => {
      map.set(`${msg.row}-${msg.col}`, msg);
    });
    return map;
  }, [messages]);

  // Generate grid once and only update when messages change
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
          TogetherWeRise - International Women&apos;s Day
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Grid section */}
          <div className="flex-1 min-w-0">
            <div className="text-center mb-4 text-sm text-gray-600">
              Click empty blocks to add messages • Click existing blocks to edit • Hover to view content
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
          onCancel={() => {
            setSelectedPosition(null);
            setSelectedMessage(null);
          }}
          existingMessage={selectedMessage || undefined}
        />
      )}
    </div>
  );
}
