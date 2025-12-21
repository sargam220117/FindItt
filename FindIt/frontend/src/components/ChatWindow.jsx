import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const ChatWindow = ({ responseId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const messageEndRef = useRef(null);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.emit('joinRoom', responseId);

    socketRef.current.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/chat/${responseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        setMessages(data);
        
        await fetch(`http://localhost:5000/api/chat/${responseId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    return () => {
      socketRef.current.emit('leaveRoom', responseId);
      socketRef.current.disconnect();
    };
  }, [responseId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/chat/${responseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (res.ok) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg z-50">
      <div className="bg-navy px-4 py-3 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold text-golden">Chat</h3>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-golden"
        >
          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div className="h-96 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.sender._id === user._id
                  ? 'bg-navy text-golden'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p>{message.content}</p>
              <span className="text-xs opacity-75 block mt-1">
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-navy"
          />
          <button
            type="submit"
            className="bg-navy text-golden px-4 py-2 rounded-lg hover:bg-navy/80 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;