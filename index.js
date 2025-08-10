require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const { connectToMongo } = require('./utils/mongo');
const { startConsumer, stopConsumer } = require('./kafka/consumer');
const fraudRoutes = require('./routes/fraud');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use('/', fraudRoutes);

const server = app.listen(PORT, async () => {
  logger.info(`Server listening on port ${PORT}`);
  // Connect to Mongo
  await connectToMongo();

  // Start Kafka consumer
  try {
    await startConsumer();
  } catch (err) {
    logger.error('Kafka consumer failed to start', { error: err.message });
  }
});

// Graceful shutdown
async function shutdown() {
  logger.info('Shutdown initiated');
  try {
    await stopConsumer();
  } catch (err) {
    logger.error('Error while stopping Kafka consumer', { error: err.message });
  }

  try {
    const { mongoose } = require('./utils/mongo');
    if (mongoose && mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      logger.info('Mongo disconnected');
    }
  } catch (err) {
    logger.error('Error disconnecting Mongo', { error: err.message });
  }

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force exit in 10s
  setTimeout(() => {
    logger.error('Forcing shutdown');
    process.exit(1);
  }, 10_000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
});
