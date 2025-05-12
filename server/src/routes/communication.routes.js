const express = require('express');
const CommunicationLog = require('../models/communication-log.model');
const { auth } = require('../middleware/auth.middleware');
const logger = require('../utils/logger');

const router = express.Router();

// Get communication logs for a campaign
router.get('/campaign/:campaignId', auth, async (req, res) => {
  try {
    const logs = await CommunicationLog.find({
      campaignId: req.params.campaignId,
      createdBy: req.user._id
    })
    .populate('customerId', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    logger.error('Get communication logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching communication logs'
    });
  }
});

// Handle delivery receipt from vendor
router.post('/receipt', async (req, res) => {
  try {
    const { messageId, status, timestamp, metadata } = req.body;

    if (!messageId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Message ID and status are required'
      });
    }

    // Find the communication log by vendor's message ID
    const log = await CommunicationLog.findOne({
      'vendorResponse.messageId': messageId
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Communication log not found'
      });
    }

    // Update the log with delivery receipt
    log.status = status;
    log.deliveryReceipt = {
      status,
      timestamp,
      metadata
    };
    log.lastAttempt = new Date();

    await log.save();

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    logger.error('Handle delivery receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing delivery receipt'
    });
  }
});

// Get delivery statistics for a campaign
router.get('/stats/:campaignId', auth, async (req, res) => {
  try {
    const stats = await CommunicationLog.aggregate([
      {
        $match: {
          campaignId: req.params.campaignId,
          createdBy: req.user._id
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = stats.reduce((acc, curr) => acc + curr.count, 0);
    const formattedStats = stats.reduce((acc, curr) => {
      acc[curr._id] = {
        count: curr.count,
        percentage: ((curr.count / total) * 100).toFixed(2)
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total,
        stats: formattedStats
      }
    });
  } catch (error) {
    logger.error('Get delivery stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery statistics'
    });
  }
});

module.exports = router; 