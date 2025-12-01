const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000, // 30 segundos
      socketTimeoutMS: 45000, // 45 segundos
      heartbeatFrequencyMS: 10000, // 10 segundos
      retryWrites: true,
      retryReads: true,
    });

    console.log(`Conectado a MongoDB: ${conn.connection.host}`);

    // Manejar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('Error de conexión a MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconectado');
    });

  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;