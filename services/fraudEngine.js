const logger = require('../utils/logger');
const  FraudModel = require('../models/fraud')

const WINDOW_MS = 10 * 1000; // 10 seconds
const recentTxs = new Map(); // userId -> array of timestamps (ms)

/**
 * Evaluate rules and store flagged transactions
 * tx should be: { transactionId, userId, amount, location, timestamp }
 */
async function processTransaction(tx) {
  const nowMs = Date.now();
  const txTs = tx.timestamp ? Date.parse(tx.timestamp) : nowMs;
  const transactionId = tx.transactionId || `unknown_${Math.random().toString(36).slice(2,8)}`;
  const userId = tx.userId || 'unknown_user';
  const amount = Number(tx.amount || 0);
  const location = (tx.location || '').toString();

  logger.info('Received transaction', { transactionId, userId, amount, location, timestamp: new Date(txTs).toISOString() });

  const violated = [];

  // Rule 1: Amount > 5000 and location != "USA"
  if (amount > 5000 && location.toUpperCase() !== 'USA') {
    violated.push('AMOUNT_GT_5000_NON_USA');
  }

  // Rule 2: Multiple transactions from same user in < 10 seconds
  const arr = recentTxs.get(userId) || [];
  const recent = arr.filter(t => (txTs - t) <= WINDOW_MS);
  if (recent.length >= 1) {
    // there was at least one other tx within the window
    violated.push('MULTIPLE_TX_WITHIN_10S');
  }
  // add current ts and keep only recent ones
  recent.push(txTs);
  recentTxs.set(userId, recent);

  // Rule 3: Amount is a round number divisible by 1000
  if (amount % 1000 === 0 && amount !== 0) {
    violated.push('AMOUNT_ROUND_THOUSAND');
  }

  if (violated.length > 0) {
    const flagged = {
      transactionId,
      userId,
      amount,
      location,
      timestamp: new Date(txTs),
      rules: violated,
      detectedAt: new Date()
    };

    // Structured warn log for each detection
    logger.warn('Fraud detected', {
      transactionId,
      userId,
      rules: violated,
      detectedAt: flagged.detectedAt.toISOString()
    });

    // Save in-memory currently not using 
    // await inMemoryStore.save(flagged);

    // Persist to Mongo db
    try {
        await FraudModel.create(flagged);
    } catch (err) {
      logger.error('Error saving fraud to Mongo', { error: err.message });
    }
  }
}

module.exports = { processTransaction };
