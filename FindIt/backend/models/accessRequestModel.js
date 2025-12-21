import mongoose from 'mongoose';

const accessRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Item'
  },
  fullName: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  proofOfOwnership: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

accessRequestSchema.index({ item: 1, requester: 1 });
accessRequestSchema.index({ item: 1, status: 1 });

const AccessRequest = mongoose.model('AccessRequest', accessRequestSchema);
export default AccessRequest;
