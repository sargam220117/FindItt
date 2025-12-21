import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Item'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  message: {
    type: String,
    required: true
  },
  claimingMatch: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

const Response = mongoose.model('Response', responseSchema);
export default Response;