const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  sinopsis: {
    type: String,
    required: true,
    trim: true
  },
  portada: {
    type: String,
    required: true
  },
  autor: {
    type: String,
    required: true,
    trim: true
  },
  paginas: {
    type: Number,
    required: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  editorial: {
    type: String,
    required: true,
    trim: true
  },
  fechaLanzamiento: {
    type: Date,
    required: true
  },
  formato: {
    type: String,
    required: true,
    enum: ['pdf', 'epub', 'mobi', 'azw3'],
    default: 'pdf'
  },
  categoria: {
    type: String,
    required: true,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  promocional: {
    type: Number,
    enum: [0, 1],
    default: 0
  },
  oferta: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  precioFinal: {
    type: Number,
    required: true
  },
  ebook: {
    type: String,
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Middleware para calcular precioFinal antes de guardar
bookSchema.pre('save', function(next) {
  if (this.promocional === 1 && this.oferta > 0) {
    this.precioFinal = this.precio - (this.precio * this.oferta / 100);
  } else {
    this.precioFinal = this.precio;
  }
  next();
});

// Índices para mejor performance
bookSchema.index({ categoria: 1 });
bookSchema.index({ promocional: 1 });
bookSchema.index({ activo: 1 });
bookSchema.index({ precioFinal: 1 });

module.exports = mongoose.model('Book', bookSchema);