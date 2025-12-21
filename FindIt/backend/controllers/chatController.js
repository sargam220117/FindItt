import asyncHandler from 'express-async-handler';
import Message from '../models/messageModel.js';

const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ responseId: req.params.responseId })
    .populate('sender', 'name email')
    .sort({ createdAt: 1 });

  res.json(messages);
});

const createMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const responseId = req.params.responseId;

  if (!content) {
    res.status(400);
    throw new Error('Please enter a message');
  }

  const message = await Message.create({
    sender: req.user._id,
    content,
    responseId,
    readBy: [req.user._id],
  });

  const populatedMessage = await message.populate('sender', 'name email');
  
  req.app.get('io').to(responseId).emit('message', populatedMessage);

  res.status(201).json(populatedMessage);
});

const markMessagesAsRead = asyncHandler(async (req, res) => {
  await Message.updateMany(
    {
      responseId: req.params.responseId,
      readBy: { $ne: req.user._id },
    },
    {
      $addToSet: { readBy: req.user._id },
    }
  );

  res.json({ message: 'Messages marked as read' });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadMessages = await Message.countDocuments({
    readBy: { $ne: req.user._id }
  });

  res.json({ count: unreadMessages });
});

export { getMessages, createMessage, markMessagesAsRead, getUnreadCount };