import asyncHandler from 'express-async-handler';
import Item from '../models/itemModel.js';

const createItem = asyncHandler(async (req, res) => {
  const { name, description, category, itemCategory, location, date, images, imagePrivacy } = req.body;

  const item = await Item.create({
    user: req.user._id,
    name,
    description,
    category,
    itemCategory,
    location,
    date,
    images,
    imagePrivacy: imagePrivacy || {
      isPrivate: true,
      allowedUsers: []
    }
  });

  if (item) {
    res.status(201).json(item);
  } else {
    res.status(400);
    throw new Error('Invalid item data');
  }
});

const getItems = asyncHandler(async (req, res) => {
  const { category, itemCategory, search } = req.query;
  
  let query = {};
  
  if (category) {
    query.category = category;
  }

  if (itemCategory) {
    query.itemCategory = itemCategory;
  }
  
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const items = await Item.find(query)
    .populate('user', 'name email')
    .populate('approvedUsers', '_id');
  res.json(items);
});

const getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id)
    .populate('user', 'name email')
    .populate('approvedUsers', '_id');

  if (item) {
    res.json(item);
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

const getMyItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ user: req.user._id })
    .populate('approvedUsers', '_id');
  res.json(items);
});

const updateItemStatus = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (item) {
    if (item.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this item');
    }

    item.status = req.body.status || item.status;
    const updatedItem = await item.save();
    res.json(updatedItem);
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (item) {
    if (item.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this item');
    }

    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (item) {
    if (item.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this item');
    }

    const { name, description, category, itemCategory, location, date, images, imagePrivacy } = req.body;

    item.name = name || item.name;
    item.description = description || item.description;
    item.category = category || item.category;
    item.itemCategory = itemCategory || item.itemCategory;
    item.location = location || item.location;
    item.date = date || item.date;
    item.images = images || item.images;
    item.imagePrivacy = imagePrivacy || item.imagePrivacy;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

export {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  updateItemStatus,
  updateItem,
  deleteItem,
};