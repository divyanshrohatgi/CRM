const amqp = require('amqplib');
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const MONGODB_URI = process.env.MONGODB_URI;

async function startConsumer() {
  await mongoose.connect(MONGODB_URI);
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  const queue = 'customer-ingestion';

  await channel.assertQueue(queue, { durable: true });
  console.log('Waiting for messages in', queue);

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      try {
        const { type, data } = JSON.parse(msg.content.toString());
        if (type === 'create') {
          await Customer.create(data);
          console.log('Customer created:', data.email);
        } else if (type === 'bulk-create' && Array.isArray(data)) {
          await Customer.insertMany(data);
          console.log('Bulk customers created:', data.length);
        }
        channel.ack(msg);
      } catch (err) {
        console.error('Error processing customer:', err);
        channel.nack(msg, false, false);
      }
    }
  });
}

startConsumer().catch(console.error);
