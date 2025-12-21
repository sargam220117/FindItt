import asyncHandler from 'express-async-handler';
import AccessRequest from '../models/accessRequestModel.js';
import Item from '../models/itemModel.js';
import { createNotification } from './notificationController.js';

const createAccessRequest = asyncHandler(async (req, res) => {
  const { itemId, fullName, mobileNumber, reason, proofOfOwnership } = req.body;

  const item = await Item.findById(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  if (item.approvedUsers.includes(req.user._id)) {
    res.status(400);
    throw new Error('You already have access to this item');
  }

  const existingRequest = await AccessRequest.findOne({
    item: itemId,
    requester: req.user._id,
    status: 'pending'
  });

  if (existingRequest) {
    res.status(400);
    throw new Error('You already have a pending access request for this item');
  }

  const accessRequest = await AccessRequest.create({
    requester: req.user._id,
    item: itemId,
    fullName,
    mobileNumber,
    reason,
    proofOfOwnership: proofOfOwnership || ''
  });

  await createNotification(
    item.user,
    'access_request',
    'New Access Request',
    `${fullName} has requested access to view your "${item.name}" image.`,
    {
      itemId: item._id,
      accessRequestId: accessRequest._id,
      userId: req.user._id,
      actionUrl: `/access-requests`
    }
  );

  res.status(201).json(accessRequest);
});

const getItemAccessRequests = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const item = await Item.findById(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  if (item.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to view requests for this item');
  }

  const requests = await AccessRequest.find({ item: itemId })
    .populate('requester', 'name email')
    .sort({ createdAt: -1 });

  res.json(requests);
});

const getUserItemAccessRequests = asyncHandler(async (req, res) => {
  const items = await Item.find({ user: req.user._id }).select('_id');
  const itemIds = items.map(item => item._id);

  const requests = await AccessRequest.find({ item: { $in: itemIds } })
    .populate('requester', 'name email')
    .populate('item', 'name category')
    .sort({ createdAt: -1 });

  res.json(requests);
});

const approveAccessRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const accessRequest = await AccessRequest.findById(requestId);
  if (!accessRequest) {
    res.status(404);
    throw new Error('Access request not found');
  }

  const item = await Item.findById(accessRequest.item);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  if (item.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to approve requests for this item');
  }
  accessRequest.status = 'approved';
  accessRequest.reviewedBy = req.user._id;
  accessRequest.reviewedAt = new Date();
  await accessRequest.save();

  if (!item.approvedUsers.includes(accessRequest.requester)) {
    item.approvedUsers.push(accessRequest.requester);
    await item.save();
  }
  await createNotification(
    accessRequest.requester,
    'access_approved',
    'Access Granted',
    `Your access request for "${item.name}" has been approved. You can now view the image.`,
    {
      itemId: item._id,
      accessRequestId: accessRequest._id,
      actionUrl: `/items/${item._id}`
    }
  );

  res.json({
    success: true,
    message: 'Access request approved',
    accessRequest
  });
});

const rejectAccessRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { reviewNotes } = req.body;

  const accessRequest = await AccessRequest.findById(requestId);
  if (!accessRequest) {
    res.status(404);
    throw new Error('Access request not found');
  }

  const item = await Item.findById(accessRequest.item);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  if (item.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to reject requests for this item');
  }
  accessRequest.status = 'rejected';
  accessRequest.reviewedBy = req.user._id;
  accessRequest.reviewedAt = new Date();
  accessRequest.reviewNotes = reviewNotes || '';
  await accessRequest.save();

  await createNotification(
    accessRequest.requester,
    'access_rejected',
    'Access Request Denied',
    `Your access request for "${item.name}" has been denied by the owner.`,
    {
      itemId: item._id,
      accessRequestId: accessRequest._id
    }
  );

  res.json({
    success: true,
    message: 'Access request rejected',
    accessRequest
  });
});

const getRequestStatus = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const request = await AccessRequest.findOne({
    item: itemId,
    requester: req.user._id
  });

  if (!request) {
    return res.json({
      hasRequest: false,
      status: null,
      request: null
    });
  }

  res.json({
    hasRequest: true,
    status: request.status,
    request
  });
});

export {
  createAccessRequest,
  getItemAccessRequests,
  getUserItemAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
  getRequestStatus
};
