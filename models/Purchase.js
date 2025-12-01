const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  libro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  fechaCompra: {
    type: Date,
    default: Date.now
  },
  precioPagado: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['completado', 'pendiente', 'cancelado'],
    default: 'completado'
  },
  metodoPago: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar compras duplicadas
purchaseSchema.index({ usuario: 1, libro: 1 }, { unique: true });

// Índices para mejor performance
purchaseSchema.index({ usuario: 1 });
purchaseSchema.index({ libro: 1 });
purchaseSchema.index({ fechaCompra: -1 });

module.exports = mongoose.model('Purchase', purchaseSchema);