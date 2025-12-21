import asyncHandler from 'express-async-handler';
import Response from '../models/responseModel.js';
import Item from '../models/itemModel.js';
import User from '../models/userModel.js';
import { sendMatchNotification, sendClaimNotification } from '../utils/emailService.js';

const createResponse = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).populate('user', 'name email');

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  const { message, claimingMatch } = req.body;
  const responder = await User.findById(req.user._id);

  const response = await Response.create({
    item: item._id,
    user: req.user._id,
    message,
    claimingMatch
  });

  const populatedResponse = await Response.findById(response._id)
    .populate('user', 'name email')
    .populate('item', 'name category');

  Promise.all([
    sendClaimNotification(item.user, responder, item, message, claimingMatch),
    claimingMatch ? sendMatchNotification(item.user, responder, item) : Promise.resolve()
  ]).catch(err => console.error('Error sending notifications:', err));

  if (response) {
    res.status(201).json(populatedResponse);
  } else {
    res.status(400);
    throw new Error('Invalid response data');
  }
});

const getItemResponses = asyncHandler(async (req, res) => {
  const responses = await Response.find({ item: req.params.id })
    .populate('user', 'name email')
    .populate('item', 'name category');

  res.json(responses);
});

const updateResponseStatus = asyncHandler(async (req, res) => {
  const response = await Response.findById(req.params.id)
    .populate({
      path: 'item',
      populate: { path: 'user', select: 'name email' }
    })
    .populate('user', 'name email');

  if (!response) {
    res.status(404);
    throw new Error('Response not found');
  }

  if (response.item.user._id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this response');
  }

  const previousStatus = response.status;
  response.status = req.body.status;
  
  if (response.claimingMatch && req.body.status === 'Accepted' && previousStatus !== 'Accepted') {
    const item = await Item.findById(response.item._id);
    
    item.status = 'Resolved';
    await item.save();

    await sendMatchNotification(
      response.user,
      {
        name: response.item.user.name,
        email: response.item.user.email
      },
      {
        ...item.toObject(),
        status: 'Resolved'
      }
    );

    await Response.updateMany(
      { 
        item: item._id, 
        _id: { $ne: response._id },
        status: 'Pending'
      },
      { status: 'Rejected' }
    );
  }

  const updatedResponse = await response.save();
  res.json(updatedResponse);
});

const getMyResponses = asyncHandler(async (req, res) => {
  const responses = await Response.find({ user: req.user._id })
    .populate({
      path: 'item',
      select: 'name category status location date images user',
      populate: { path: 'user', select: 'name email' }
    })
    .sort('-createdAt');

  if (!responses) {
    return res.json([]);
  }

  res.json(responses);
});

export {
  createResponse,
  getItemResponses,
  updateResponseStatus,
  getMyResponses,
};