const mongoose = require('mongoose');

async function connectToMongo() {
  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI not provided, skipping Mongo connection.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Mongodb connected ..');
  } catch (err) {
    console.log('Error in connecting mongo', err);
  }
}

module.exports = { mongoose, connectToMongo };
