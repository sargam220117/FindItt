import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ChatWindowWithCalls from './ChatWindowWithCalls';

const ChatButton = ({ responseId, itemUserId, responseUserId }) => {
  const [showChat, setShowChat] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && responseId) {
      const otherUserId = user._id === itemUserId ? responseUserId : itemUserId;

      const fetchOtherUser = async () => {
        try {
          const res = await axios.get(`/api/users/${otherUserId}`);
          setOtherUser(res.data);
        } catch (error) {
          console.error('Error fetching other user:', error);
          setOtherUser({
            _id: otherUserId,
            name: 'User',
            email: ''
          });
        }
      };

      fetchOtherUser();
    }
  }, [user, responseId, itemUserId, responseUserId]);

  if (!user || (user._id !== itemUserId && user._id !== responseUserId)) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowChat(true)}
        className="flex items-center gap-2 text-navy dark:text-blue-400 hover:text-golden dark:hover:text-golden"
      >
        <svg
          className="w-5 h-5"
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
        <span>Open Chat</span>
      </button>

      {showChat && otherUser && (
        <ChatWindowWithCalls
          responseId={responseId}
          onClose={() => setShowChat(false)}
          otherUser={otherUser}
        />
      )}
    </>
  );
};

export default ChatButton;