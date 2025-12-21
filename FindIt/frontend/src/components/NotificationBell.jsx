import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications/unread/count');
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    if (isOpen) return;

    try {
      setLoading(true);
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'access_request':
        return <Clock className="w-5 h-5 text-electric-600" />;
      case 'access_approved':
        return <CheckCircle className="w-5 h-5 text-lime-600" />;
      case 'access_rejected':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-vivid-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'access_request':
        return 'bg-electric-50 border-electric-200';
      case 'access_approved':
        return 'bg-lime-50 border-lime-200';
      case 'access_rejected':
        return 'bg-rose-50 border-rose-200';
      default:
        return 'bg-vivid-50 border-vivid-200';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 text-slate-700 hover:text-vivid-600 transition-all duration-300"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none text-white bg-gradient-to-r from-rose-500 to-rose-600 rounded-full shadow-lg shadow-rose-500/50 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl shadow-vivid-500/10 z-50 border border-vivid-100">
          <div className="flex items-center justify-between p-4 border-b border-vivid-100 bg-gradient-to-r from-vivid-50 to-electric-50 rounded-t-xl">
            <h3 className="text-lg font-bold bg-gradient-to-r from-vivid-600 to-electric-600 bg-clip-text text-transparent">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-vivid-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center"><div className="spinner mx-auto"></div></div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map(notification => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gradient-to-r hover:from-vivid-50/30 hover:to-electric-50/30 transition border-l-4 cursor-pointer ${getNotificationColor(notification.type)
                      } ${!notification.isRead ? 'bg-electric-50/50 border-electric-300' : ''}`}
                    onClick={() => {
                      if (notification.type === 'access_request') {
                        navigate('/access-requests');
                        setIsOpen(false);
                      } else if (notification.actionUrl) {
                        navigate(notification.actionUrl);
                        setIsOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-deep-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.type === 'access_request' && (
                          <p className="text-xs text-electric-600 font-semibold mt-2">
                            👉 Click to manage request
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification._id);
                            }}
                            className="p-1 text-electric-600 hover:text-vivid-600 transition"
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification._id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-vivid-100 bg-gradient-to-r from-vivid-50 to-electric-50 rounded-b-xl text-center">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-vivid-600 hover:text-electric-600 transition-colors"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
