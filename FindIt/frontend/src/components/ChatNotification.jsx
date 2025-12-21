import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ChatNotification = () => {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const socketRef = useRef();

  useEffect(() => {
    if (!user) return;

    socketRef.current = io('https://finditt-backend-bzyl.onrender.com');

    socketRef.current.on('message', (message) => {
      if (message.sender._id !== user._id) {
        setUnreadMessages(prev => prev + 1);
      }
    });

    const fetchUnreadCount = async () => {
      try {
        const responses = await axios.get('/api/items/myitems/responses');
        let count = 0;
        
        responses.data.forEach(response => {
          if (response.status === 'Accepted') {
            count += response.unreadMessages || 0;
          }
        });
        
        setUnreadMessages(count);
      } catch (error) {
        console.error('Failed to fetch unread messages:', error);
      }
    };

    fetchUnreadCount();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  if (!user || unreadMessages === 0) return null;

  return (
    <Link 
      to="/myitems" 
      className="relative"
      onClick={() => setUnreadMessages(0)}
    >
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {unreadMessages}
      </span>
      <svg 
        className="w-6 h-6 text-white"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
        />
      </svg>
    </Link>
  );
};


export default ChatNotification;
