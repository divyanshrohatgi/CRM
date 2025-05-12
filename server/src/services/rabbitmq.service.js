const amqp = require('amqplib');
const logger = require('../utils/logger');

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queues = {
      customerIngestion: 'customer-ingestion',
      campaignDelivery: 'campaign-delivery',
      deliveryReceipt: 'delivery-receipt'
    };
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // Declare queues
      await this.channel.assertQueue(this.queues.customerIngestion, { durable: true });
      await this.channel.assertQueue(this.queues.campaignDelivery, { durable: true });
      await this.channel.assertQueue(this.queues.deliveryReceipt, { durable: true });

      logger.info('Connected to RabbitMQ');
    } catch (error) {
      logger.error('RabbitMQ connection error:', error);
      throw error;
    }
  }

  async publish(queue, data) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
        persistent: true
      });
      logger.info(`Message published to ${queue}`);
    } catch (error) {
      logger.error(`Error publishing to ${queue}:`, error);
      throw error;
    }
  }

  async consume(queue, callback) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      await this.channel.consume(queue, async (msg) => {
        if (msg !== null) {
          try {
            const data = JSON.parse(msg.content.toString());
            await callback(data);
            this.channel.ack(msg);
          } catch (error) {
            logger.error(`Error processing message from ${queue}:`, error);
            // Reject the message and requeue it
            this.channel.nack(msg, false, true);
          }
        }
      });
      logger.info(`Started consuming from ${queue}`);
    } catch (error) {
      logger.error(`Error consuming from ${queue}:`, error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const rabbitMQService = new RabbitMQService();

module.exports = rabbitMQService; 