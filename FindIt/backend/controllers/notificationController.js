import asyncHandler from 'express-async-handler';
import Notification from '../models/notificationModel.js';

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('relatedUser', 'name email')
    .populate('relatedItem', 'name category')
    .sort({ createdAt: -1 });

  res.json(notifications);
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.json({ unreadCount });
});

const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this notification');
  }

  notification.isRead = true;
  await notification.save();

  res.json(notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true, message: 'All notifications marked as read' });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this notification');
  }

  await notification.deleteOne();

  res.json({ success: true, message: 'Notification deleted' });
});

const createNotification = async (recipientId, type, title, message, relatedData = {}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedItem: relatedData.itemId || null,
      relatedAccessRequest: relatedData.accessRequestId || null,
      relatedUser: relatedData.userId || null,
      actionUrl: relatedData.actionUrl || ''
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
};
