const express = require('express');
const Segment = require('../models/segment.model');
const Customer = require('../models/customer.model');
const { auth } = require('../middleware/auth.middleware');
const logger = require('../utils/logger');

const router = express.Router();

// Get all segments (with pagination)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const segments = await Segment.find({ createdBy: req.user._id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Segment.countDocuments({ createdBy: req.user._id });

    res.json({
      success: true,
      data: segments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get segments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching segments'
    });
  }
});

// Get segment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const segment = await Segment.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }

    res.json({
      success: true,
      data: segment
    });
  } catch (error) {
    logger.error('Get segment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching segment'
    });
  }
});

// Create segment
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, rules, groups, ruleLogic } = req.body;

    // Validate required fields
    if (!name || !rules || !Array.isArray(rules) || !groups || !Array.isArray(groups)) {
      return res.status(400).json({
        success: false,
        message: 'Name, rules array, and groups array are required'
      });
    }

    // Validate that all rules have a valid groupId
    const validGroupIds = groups.map(g => g.id);
    const invalidRules = rules.filter(rule => !validGroupIds.includes(rule.groupId));
    if (invalidRules.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'All rules must have a valid groupId'
      });
    }

    // Create segment
    const segment = new Segment({
      name,
      description,
      rules,
      groups,
      ruleLogic: ruleLogic || 'AND',
      createdBy: req.user._id
    });

    // Evaluate segment size
    const customers = await Customer.find();
    const matchingCustomers = await Promise.all(
      customers.map(customer => segment.evaluateCustomer(customer))
    );
    segment.customerCount = matchingCustomers.filter(Boolean).length;

    await segment.save();

    res.status(201).json({
      success: true,
      data: segment
    });
  } catch (error) {
    logger.error('Create segment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating segment'
    });
  }
});

// Update segment
router.put('/:id', auth, async (req, res) => {
  try {
    const segment = await Segment.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }

    const { rules, groups } = req.body;

    // Validate that all rules have a valid groupId if groups are provided
    if (groups && Array.isArray(groups)) {
      const validGroupIds = groups.map(g => g.id);
      const invalidRules = rules.filter(rule => !validGroupIds.includes(rule.groupId));
      if (invalidRules.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'All rules must have a valid groupId'
        });
      }
    }

    // Update segment fields
    Object.assign(segment, req.body);

    // Re-evaluate segment size if rules or groups changed
    if (req.body.rules || req.body.groups) {
      const customers = await Customer.find();
      const matchingCustomers = await Promise.all(
        customers.map(customer => segment.evaluateCustomer(customer))
      );
      segment.customerCount = matchingCustomers.filter(Boolean).length;
    }

    await segment.save();

    res.json({
      success: true,
      data: segment
    });
  } catch (error) {
    logger.error('Update segment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating segment'
    });
  }
});

// Delete segment
router.delete('/:id', auth, async (req, res) => {
  try {
    const segment = await Segment.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }

    res.json({
      success: true,
      message: 'Segment deleted successfully'
    });
  } catch (error) {
    logger.error('Delete segment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting segment'
    });
  }
});

// Preview segment size
router.post('/preview', auth, async (req, res) => {
  try {
    const { rules, ruleLogic } = req.body;

    if (!rules || !Array.isArray(rules)) {
      return res.status(400).json({
        success: false,
        message: 'Rules array is required'
      });
    }

    // Create temporary segment for preview
    const tempSegment = new Segment({
      rules,
      ruleLogic: ruleLogic || 'AND'
    });

    // Evaluate segment size
    const customers = await Customer.find();
    const matchingCustomers = await Promise.all(
      customers.map(customer => tempSegment.evaluateCustomer(customer))
    );
    const count = matchingCustomers.filter(Boolean).length;

    res.json({
      success: true,
      data: {
        count,
        percentage: (count / customers.length * 100).toFixed(2)
      }
    });
  } catch (error) {
    logger.error('Preview segment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error previewing segment'
    });
  }
});

module.exports = router; 