const { Kafka } = require('kafkajs');
const logger = require('../utils/logger');
const fraudEngine = require('../services/fraudEngine');

let kafka;
let consumer;

async function startConsumer() {
  const brokers = (process.env.KAFKA_BROKER || 'localhost:9092').split(',');
  kafka = new Kafka({
    clientId: 'fraud-service',
    brokers
  });

  consumer = kafka.consumer({ groupId: process.env.CONSUMER_GROUP || 'fraud-detectors' });

  try {
    await consumer.connect();
    logger.info('Kafka consumer connected', { brokers });

    const topic = process.env.KAFKA_TOPIC || 'transactions';
    await consumer.subscribe({ topic, fromBeginning: false });
    logger.info('Kafka consumer subscribed', { topic });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {

        const raw = message.value ? message.value.toString() : null;
        logger.info('Message received from Kafka', { topic, partition, offset: message.offset });

        if (!raw) {
          logger.warn('Empty message received, skipping', { offset: message.offset });
          return;
        }

        let tx;
        try {
          tx = JSON.parse(raw);
        } catch (err) {
          logger.warn('Invalid JSON in Kafka message, skipping', { error: err.message, raw });
          return;
        }

        try {
          await fraudEngine.processTransaction(tx);
        } catch (err) {
          logger.error('Error processing transaction', { error: err.message, transaction: tx });
        }
      }
    });

  } catch (err) {
    logger.error('Failed to start Kafka consumer', { error: err.message });
    throw err;
  }
}

async function stopConsumer() {
  try {
    if (consumer) {
      await consumer.disconnect();
      logger.info('Kafka consumer disconnected');
    }
  } catch (err) {
    logger.error('Error disconnecting Kafka consumer', { error: err.message });
  }
}

module.exports = { startConsumer, stopConsumer };
