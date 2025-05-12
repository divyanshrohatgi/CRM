const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  segmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Segment',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'FAILED', 'DELIVERED'],
    default: 'PENDING'
  },
  vendorResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  deliveryReceipt: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0
  },
  lastAttempt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
communicationLogSchema.index({ campaignId: 1 });
communicationLogSchema.index({ customerId: 1 });
communicationLogSchema.index({ status: 1 });
communicationLogSchema.index({ createdAt: 1 });

const CommunicationLog = mongoose.model('CommunicationLog', communicationLogSchema);

module.exports = CommunicationLog; 