const express = require('express');
const Campaign = require('../models/campaign.model');
const Segment = require('../models/segment.model');
const { auth } = require('../middleware/auth.middleware');
const rabbitMQService = require('../services/rabbitmq.service');
const logger = require('../utils/logger');

const router = express.Router();

// Get all campaigns (with pagination)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const campaigns = await Campaign.find({ createdBy: req.user._id })
      .populate('segment', 'name description')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Campaign.countDocuments({ createdBy: req.user._id });

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaigns'
    });
  }
});

// Get campaign by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('segment', 'name description');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign'
    });
  }
});

// Create campaign
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, segmentId, message, scheduleTime } = req.body;

    // Validate required fields
    if (!name || !segmentId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, segment, and message are required'
      });
    }

    // Check if segment exists
    const segment = await Segment.findOne({
      _id: segmentId,
      createdBy: req.user._id
    });

    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }

    // Create campaign
    const campaign = new Campaign({
      name,
      description,
      segment: segmentId,
      message,
      scheduleTime,
      createdBy: req.user._id
    });

    await campaign.save();

    // Publish to RabbitMQ for campaign delivery
    await rabbitMQService.publish('campaign-delivery', {
      type: 'new-campaign',
      data: {
        campaignId: campaign._id,
        segmentId,
        message
      }
    });

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating campaign',
      error: error.message
    });
  }
});

// Update campaign
router.put('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id
      },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or cannot be updated'
      });
    }

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating campaign',
      error: error.message
    });
  }
});

// Delete campaign
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
      status: { $in: ['draft', 'scheduled'] }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or cannot be deleted'
      });
    }

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    logger.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting campaign'
    });
  }
});

// Get campaign stats
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: campaign.stats
    });
  } catch (error) {
    logger.error('Get campaign stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign stats'
    });
  }
});

module.exports = router; 