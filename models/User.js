const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  supabaseUserId: {
    type: String,
    required: true,
    unique: true
  },
  nombres: {
    type: String,
    required: true,
    trim: true
  },
  apellidos: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  telefono: {
    type: String,
    required: true,
    trim: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  ultimoAcceso: {
    type: Date,
    default: Date.now
  },
  rol: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Índices para mejor performance
userSchema.index({ email: 1 });
userSchema.index({ supabaseUserId: 1 });

module.exports = mongoose.model('User', userSchema);