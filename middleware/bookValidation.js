const Joi = require('joi');

const bookValidation = {
  createBook: Joi.object({
    titulo: Joi.string().required().trim().min(1).max(255),
    sinopsis: Joi.string().required().trim().min(10).max(2000),
    portada: Joi.string().required().uri(),
    autor: Joi.string().required().trim().min(1).max(100),
    paginas: Joi.number().required().min(1),
    isbn: Joi.string().required().trim(),
    editorial: Joi.string().required().trim().min(1).max(100),
    fechaLanzamiento: Joi.date().required().max('now'),
    formato: Joi.string().valid('pdf', 'epub', 'mobi', 'azw3').required(),
    categoria: Joi.string().required().trim().min(1).max(50),
    precio: Joi.number().required().min(0),
    promocional: Joi.number().valid(0, 1),
    oferta: Joi.number().min(0).max(100),
    ebook: Joi.string().required().uri()
  }),

  updateBook: Joi.object({
    titulo: Joi.string().trim().min(1).max(255),
    sinopsis: Joi.string().trim().min(10).max(2000),
    portada: Joi.string().uri(),
    autor: Joi.string().trim().min(1).max(100),
    paginas: Joi.number().min(1),
    isbn: Joi.string().trim(),
    editorial: Joi.string().trim().min(1).max(100),
    fechaLanzamiento: Joi.date().max('now'),
    formato: Joi.string().valid('pdf', 'epub', 'mobi', 'azw3'),
    categoria: Joi.string().trim().min(1).max(50),
    precio: Joi.number().min(0),
    promocional: Joi.number().valid(0, 1),
    oferta: Joi.number().min(0).max(100),
    ebook: Joi.string().uri(),
    activo: Joi.boolean()
  })
};

const validateBook = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

module.exports = {
  bookValidation,
  validateBook
};