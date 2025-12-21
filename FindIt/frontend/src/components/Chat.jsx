import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const Chat = ({ responseId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.emit('joinRoom', responseId);

    socketRef.current.on('message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
      scrollToBottom();
    });

    fetchMessages();

    return () => {
      socketRef.current.emit('leaveRoom', responseId);
      socketRef.current.disconnect();
    };
  }, [responseId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/chat/${responseId}`);
      setMessages(response.data);
      scrollToBottom();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      await axios.post(`/api/chat/${responseId}`, {
        content: newMessage
      });
      setNewMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) return <div className="p-4">Loading chat...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg shadow">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.sender._id === user._id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender._id === user._id
                  ? 'bg-navy text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}
            >
              <div className="flex items-baseline mb-1">
                <span className={`text-sm font-semibold ${
                  message.sender._id === user._id ? 'text-golden' : 'text-deepBlue'
                }`}>
                  {message.sender.name}
                </span>
                <span className="ml-2 text-xs text-gray-400">
                  {format(new Date(message.createdAt), 'h:mm a')}
                </span>
              </div>
              <p className="break-words">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input-field"
          />
          <button type="submit" className="btn-primary whitespace-nowrap">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;