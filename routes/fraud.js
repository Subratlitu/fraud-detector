// routes/frauds.js
const express = require('express');
const router = express.Router();
const { mongoose } = require('../utils/mongo');
let FraudModel;
try { FraudModel = require('../models/fraud'); } catch (e) { FraudModel = null; }

/**
 * GET /frauds
 * Returns list of all flagged transactions.
 */
router.get('/frauds', async (req, res) => {
  try {
      const docs = await FraudModel.find().sort({ detectedAt: -1 }).lean();
      return res.json(docs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /frauds/:userId
 */
router.get('/frauds/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
      const docs = await FraudModel.find({ userId }).sort({ detectedAt: -1 }).lean();
      return res.json(docs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /health
 */
router.get('/health', (req, res) => {
  const mongoState = mongoose && mongoose.connection ? mongoose.connection.readyState : 0;
  // readyState 1 = connected
  res.json({ status: 'ok', mongoConnected: mongoState === 1 });
});

module.exports = router;
