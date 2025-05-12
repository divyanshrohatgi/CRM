const axios = require('axios');
const logger = require('../utils/logger');

class VendorAPIService {
  constructor() {
    this.baseURL = process.env.VENDOR_API_URL || 'http://localhost:3000/api/vendor';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VENDOR_API_KEY}`
      }
    });
  }

  async sendMessage(customer, message) {
    try {
      // Simulate vendor API call with 90% success rate
      const isSuccess = Math.random() < 0.9;

      if (!isSuccess) {
        throw new Error('Vendor API simulated failure');
      }

      // Simulate API response
      const response = {
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'SENT',
        timestamp: new Date().toISOString()
      };

      // Simulate delivery receipt after a random delay (1-5 seconds)
      setTimeout(async () => {
        try {
          await this.sendDeliveryReceipt(response.messageId, 'DELIVERED');
        } catch (error) {
          logger.error('Error sending delivery receipt:', error);
        }
      }, Math.random() * 4000 + 1000);

      return response;
    } catch (error) {
      logger.error('Vendor API error:', error);
      throw error;
    }
  }

  async sendDeliveryReceipt(messageId, status) {
    try {
      const receipt = {
        messageId,
        status,
        timestamp: new Date().toISOString(),
        metadata: {
          deviceInfo: 'Simulated Device',
          location: 'Simulated Location'
        }
      };

      // Send receipt to our backend
      await axios.post(`${process.env.API_URL}/api/communications/receipt`, receipt);

      return receipt;
    } catch (error) {
      logger.error('Error sending delivery receipt:', error);
      throw error;
    }
  }
}

module.exports = new VendorAPIService(); 