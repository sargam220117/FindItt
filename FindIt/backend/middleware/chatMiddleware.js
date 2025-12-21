import asyncHandler from 'express-async-handler';
import Response from '../models/responseModel.js';
import Item from '../models/itemModel.js';

const checkChatAccess = asyncHandler(async (req, res, next) => {
  const response = await Response.findById(req.params.responseId)
    .populate({
      path: 'item',
      select: 'user'
    });

  if (!response) {
    res.status(404);
    throw new Error('Response not found');
  }

  if (response.item.user.toString() !== req.user._id.toString() && 
      response.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this chat');
  }

  if (response.status !== 'Accepted') {
    res.status(403);
    throw new Error('Chat is only available for accepted responses');
  }

  next();
});

export { checkChatAccess };