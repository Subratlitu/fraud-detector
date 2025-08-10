require('dotenv').config();
const { Kafka } = require('kafkajs');

const brokers = (process.env.KAFKA_BROKER || 'localhost:9092').split(',');
const kafka = new Kafka({ clientId: 'tx-producer', brokers });
const topic = process.env.KAFKA_TOPIC || 'transactions';

const producer = kafka.producer();

/**
 * generate example transaction
 */
function makeTx(overrides = {}) {
  const id = 'txn_' + Math.random().toString(36).slice(2, 9);
  const user = overrides.userId || `user_${Math.floor(Math.random() * 5)}`;
  const amounts = [1200, 500, 7400, 1000, 999, 6000,1243];
  const amount = overrides.amount !== undefined ? overrides.amount : amounts[Math.floor(Math.random() * amounts.length)];
  const locations = ['USA', 'Nigeria', 'India', 'UK', 'USA'];
  const location = overrides.location || locations[Math.floor(Math.random() * locations.length)];
  const timestamp = overrides.timestamp || new Date().toISOString();

  return { transactionId: id, userId: user, amount, location, timestamp };
}


async function sendMany(n = 5, delay = 500) {
  await producer.connect();
  for (let i = 0; i < n; i++) {
    console.log(i)
    const tx = makeTx();
    await producer.send({ topic, messages: [{ value: JSON.stringify(tx) }]});
    console.log('Sent', tx);
    await new Promise(r => setTimeout(r, delay));
  }
  await producer.disconnect();
}

(async () => {
  // send 10 messages quickly to test multiple-in-10s rule
  await sendMany(10, 200);
})();
