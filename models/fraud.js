const { mongoose } = require('../utils/mongo');
const Schema = mongoose.Schema;

const FraudSchema = new Schema({
  transactionId: { type: String, index: true },
  userId: String,
  amount: Number,
  location: String,
  timestamp: Date,
  rules: [String],
  detectedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Fraud || mongoose.model('Fraud', FraudSchema);
