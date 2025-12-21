import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle, AlertCircle, Clock, Trash2, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
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

  const handleMarkAsRead = async (notificationId) => {
    try {
      setActionLoading(notificationId);
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      setActionLoading(notificationId);
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading('all');
      await axios.put('/api/notifications/read/all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'access_request':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'access_approved':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'access_rejected':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Bell className="w-6 h-6 text-blue-600" />;
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return 'bg-gray-50 border-gray-200';
    
    switch (type) {
      case 'access_request':
        return 'bg-yellow-50 border-yellow-200';
      case 'access_approved':
        return 'bg-green-50 border-green-200';
      case 'access_rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-navy-900 mb-2">Notifications</h1>
        <p className="text-slate-600 dark:text-slate-300">Stay updated with access requests and item activities</p>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All
            <span className="ml-2 text-sm">({notifications.length})</span>
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Unread
            <span className="ml-2 text-sm">({unreadCount})</span>
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading === 'all'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {filteredNotifications.length === 0 ? (
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map(notification => (
            <Card
              key={notification._id}
              className={`border-l-4 ${getNotificationColor(notification.type, notification.isRead)}`}
            >
              <div className="p-6 flex items-start gap-4">
                <div className="flex-shrink-0 pt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        New
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 mb-3 leading-relaxed">
                    {notification.message}
                  </p>

                  {notification.relatedItem && (
                    <div 
                      className="bg-white dark:bg-slate-800 bg-opacity-50 rounded p-3 mb-3 cursor-pointer hover:bg-opacity-75 transition"
                      onClick={() => {
                        if (notification.type === 'access_request') {
                          navigate('/access-requests');
                        } else if (notification.actionUrl) {
                          navigate(notification.actionUrl);
                        }
                      }}
                    >
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Item:</span> {notification.relatedItem.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Category: {notification.relatedItem.category}
                      </p>
                      {notification.type === 'access_request' && (
                        <p className="text-xs text-blue-600 font-semibold mt-2">
                          👉 Click to manage access requests →
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
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
                      onClick={() => handleMarkAsRead(notification._id)}
                      disabled={actionLoading === notification._id}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded transition"
                    >
                      Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification._id)}
                    disabled={actionLoading === notification._id}
                    className="p-2 text-gray-400 hover:text-red-600 disabled:text-gray-300 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
