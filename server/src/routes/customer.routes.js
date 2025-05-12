const express = require('express');
const Customer = require('../models/customer.model');
const { auth, adminAuth } = require('../middleware/auth.middleware');
const rabbitMQService = require('../services/rabbitmq.service');
const logger = require('../utils/logger');

const router = express.Router();

// Get all customers (with pagination)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const customers = await Customer.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments();

    res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers'
    });
  }
});

// Get customer by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    logger.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer'
    });
  }
});

// Create customer (direct, for demo/dev)
router.post('/', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    const customer = await Customer.create(req.body);
    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    logger.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer'
    });
  }
});

// Update customer
router.put('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    logger.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer'
    });
  }
});

// Delete customer (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    logger.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer'
    });
  }
});

// Bulk create customers (async via RabbitMQ)
router.post('/bulk', auth, async (req, res) => {
  try {
    const { customers } = req.body;
    if (!Array.isArray(customers)) {
      return res.status(400).json({
        success: false,
        message: 'Customers must be an array'
      });
    }

    // Publish to RabbitMQ for async processing
    await rabbitMQService.publish('customer-ingestion', {
      type: 'bulk-create',
      data: customers
    });

    res.status(202).json({
      success: true,
      message: 'Bulk customer creation request accepted'
    });
  } catch (error) {
    logger.error('Bulk create customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing bulk customer creation'
    });
  }
});

module.exports = router; 