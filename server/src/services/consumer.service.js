const Customer = require('../models/customer.model');
const Campaign = require('../models/campaign.model');
const Segment = require('../models/segment.model');
const CommunicationLog = require('../models/communication-log.model');
const rabbitMQService = require('./rabbitmq.service');
const logger = require('../utils/logger');

class ConsumerService {
  constructor() {
    this.setupConsumers();
  }

  async setupConsumers() {
    // Customer ingestion consumer
    await rabbitMQService.consume('customer-ingestion', async (message) => {
      try {
        const { type, data } = message;

        switch (type) {
          case 'create':
            await this.handleCustomerCreation(data);
            break;
          case 'bulk-create':
            await this.handleBulkCustomerCreation(data);
            break;
          default:
            logger.warn(`Unknown customer ingestion type: ${type}`);
        }
      } catch (error) {
        logger.error('Customer ingestion consumer error:', error);
        throw error;
      }
    });

    // Campaign delivery consumer
    await rabbitMQService.consume('campaign-delivery', async (message) => {
      try {
        const { type, data } = message;

        switch (type) {
          case 'new-campaign':
            await this.handleCampaignDelivery(data);
            break;
          default:
            logger.warn(`Unknown campaign delivery type: ${type}`);
        }
      } catch (error) {
        logger.error('Campaign delivery consumer error:', error);
        throw error;
      }
    });

    // Delivery receipt consumer
    await rabbitMQService.consume('delivery-receipt', async (message) => {
      try {
        await this.handleDeliveryReceipt(message);
      } catch (error) {
        logger.error('Delivery receipt consumer error:', error);
        throw error;
      }
    });
  }

  async handleCustomerCreation(data) {
    try {
      const customer = new Customer(data);
      await customer.save();
      logger.info(`Customer created: ${customer._id}`);
    } catch (error) {
      logger.error('Customer creation error:', error);
      throw error;
    }
  }

  async handleBulkCustomerCreation(customers) {
    try {
      const operations = customers.map(customer => ({
        insertOne: {
          document: customer
        }
      }));

      const result = await Customer.bulkWrite(operations, {
        ordered: false
      });

      logger.info(`Bulk customer creation completed: ${result.insertedCount} customers created`);
    } catch (error) {
      logger.error('Bulk customer creation error:', error);
      throw error;
    }
  }

  async handleCampaignDelivery(data) {
    try {
      const { campaignId, segmentId, message } = data;

      // Get campaign and segment
      const campaign = await Campaign.findById(campaignId);
      const segment = await Segment.findById(segmentId);

      if (!campaign || !segment) {
        throw new Error('Campaign or segment not found');
      }

      // Get customers in segment
      const customers = await Customer.find();
      const matchingCustomers = await Promise.all(
        customers.map(customer => segment.evaluateCustomer(customer))
      );
      const segmentCustomers = customers.filter((_, index) => matchingCustomers[index]);

      // Create communication logs
      const logs = segmentCustomers.map(customer => ({
        campaign: campaignId,
        customer: customer._id,
        message: message.replace('{name}', customer.name),
        status: 'pending'
      }));

      await CommunicationLog.insertMany(logs);

      // Update campaign stats
      campaign.stats.totalAudience = segmentCustomers.length;
      await campaign.save();

      // Simulate sending messages (in a real app, this would be handled by a messaging service)
      for (const customer of segmentCustomers) {
        const success = Math.random() < 0.9; // 90% success rate
        await rabbitMQService.publish('delivery-receipt', {
          campaignId,
          customerId: customer._id,
          status: success ? 'delivered' : 'failed',
          error: success ? null : 'Simulated delivery failure'
        });
      }

      logger.info(`Campaign delivery initiated: ${campaignId}`);
    } catch (error) {
      logger.error('Campaign delivery error:', error);
      throw error;
    }
  }

  async handleDeliveryReceipt(data) {
    try {
      const { campaignId, customerId, status, error } = data;

      // Update communication log
      const log = await CommunicationLog.findOneAndUpdate(
        {
          campaign: campaignId,
          customer: customerId
        },
        {
          status,
          error: error ? { message: error } : undefined,
          lastAttempt: new Date(),
          $inc: { deliveryAttempts: 1 }
        },
        { new: true }
      );

      if (!log) {
        throw new Error('Communication log not found');
      }

      // Update campaign stats
      const campaign = await Campaign.findById(campaignId);
      if (campaign) {
        campaign.stats[status === 'delivered' ? 'delivered' : 'failed']++;
        campaign.stats.sent++;
        await campaign.save();
      }

      logger.info(`Delivery receipt processed: ${log._id}`);
    } catch (error) {
      logger.error('Delivery receipt processing error:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const consumerService = new ConsumerService();

module.exports = consumerService; 