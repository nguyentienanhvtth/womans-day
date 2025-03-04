'use client';

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useCallback } from "react";
import dynamic from 'next/dynamic';

// Tách form thành component riêng
const ChatForm = dynamic(() => Promise.resolve(({ 
  onSubmit, 
  author, 
  setAuthor, 
  newMessage, 
  setNewMessage 
}: { 
  onSubmit: (e: React.FormEvent) => Promise<void>;
  author: string;
  setAuthor: (value: string) => void;
  newMessage: string;
  setNewMessage: (value: string) => void;
}) => (
  <form onSubmit={onSubmit} className="p-2 sm:p-4 border-t">
    <input
      type="text"
      placeholder="Nhập tên của bạn"
      value={author}
      onChange={(e) => setAuthor(e.target.value)}
      className="w-full text-black mb-2 px-2 sm:px-3 py-2 border rounded text-sm sm:text-base"
      required
    />
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Nhập tin nhắn..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="flex-1 text-black px-2 sm:px-3 py-2 border rounded text-sm sm:text-base"
        required
      />
      <button
        type="submit"
        className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-purple-700 text-sm sm:text-base"
      >
        Gửi
      </button>
    </div>
  </form>
)), { ssr: false });

interface BaseMessage {
  id: string;
  author: string;
  created_at: string;
}

interface ChatMessage extends BaseMessage {
  type: 'chat';
  message: string;
}

interface GridMessage extends BaseMessage {
  type: 'grid';
  content: string;
  color: string;
  row: number;
  col: number;
}

type CombinedMessage = ChatMessage | GridMessage;

export default function ChatBox() {
  const [messages, setMessages] = useState<CombinedMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [author, setAuthor] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (typeof window !== 'undefined') {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const formatTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, []);

  useEffect(() => {
    // Fetch initial messages from both tables
    const fetchAllMessages = async () => {
      // Fetch chat messages
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select("*")
        .order("created_at", { ascending: true });

      if (chatError) {
        console.error("Error fetching chat messages:", chatError);
        return;
      }

      // Fetch grid messages
      const { data: gridData, error: gridError } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (gridError) {
        console.error("Error fetching grid messages:", gridError);
        return;
      }

      // Combine and format messages
      const combinedMessages: CombinedMessage[] = [
        ...(chatData?.map(chat => ({
          ...chat,
          type: 'chat' as const
        })) || []),
        ...(gridData?.map(grid => ({
          ...grid,
          type: 'grid' as const
        })) || [])
      ].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessages(combinedMessages);
      scrollToBottom();
    };

    fetchAllMessages();

    // Tạo một kênh duy nhất cho cả hai loại tin nhắn
    const channel = supabase.channel('combined_messages');

    // Subscribe to chat messages
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
        },
        (payload) => {
          const newChat: ChatMessage = {
            type: 'chat',
            id: payload.new.id,
            author: payload.new.author,
            message: payload.new.message,
            created_at: payload.new.created_at
          };
          setMessages((current) => [...current, newChat]);
          scrollToBottom();
        }
      )
      // Subscribe to grid messages on the same channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newGrid: GridMessage = {
            type: 'grid',
            id: payload.new.id,
            author: payload.new.author,
            content: payload.new.content,
            color: payload.new.color,
            row: payload.new.row,
            col: payload.new.col,
            created_at: payload.new.created_at
          };
          setMessages((current) => [...current, newGrid]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !author.trim()) return;

    try {
      const { error } = await supabase.from("chats").insert([
        {
          author: author.trim(),
          message: newMessage.trim(),
        },
      ]);

      if (error) {
        if (error.code === '42501') {
          alert('Bạn đang gửi tin nhắn quá nhanh. Vui lòng đợi 30 giây!');
          return;
        }
        throw error;
      }
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại!");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(100vh-20rem)] lg:h-[500px]">
      <div className="p-2 sm:p-4 bg-purple-600 text-white font-semibold">
        Tin nhắn & Lời chúc
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((msg) => {
          const isGrid = msg.type === 'grid';
          return (
            <div 
              key={msg.id} 
              className={`rounded-lg p-2 sm:p-3 ${
                isGrid ? 'bg-purple-50' : 'bg-gray-50'
              }`}
            >
              <div className="font-semibold text-purple-600 text-sm sm:text-base">
                {msg.author}
                {isGrid && (
                  <span className="text-xs sm:text-sm text-purple-400 ml-2">
                    đã gửi lời chúc tại ô ({msg.row}, {msg.col})
                  </span>
                )}
              </div>
              <div 
                className="text-gray-700 text-sm sm:text-base"
                style={isGrid ? { color: msg.color } : undefined}
              >
                {isGrid ? msg.content : msg.message}
              </div>
              <div className="text-xs text-gray-400">
                {formatTime(msg.created_at)}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <ChatForm
        onSubmit={handleSubmit}
        author={author}
        setAuthor={setAuthor}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
      />
    </div>
  );
}

