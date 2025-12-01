const Purchase = require('../models/Purchase');
const Book = require('../models/Book');

// Función para validar tarjeta con algoritmo de Luhn
const validateCard = (cardNumber) => {
  const luhnCheck = (num) => {
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i]);
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  };

  const cleanNumber = cardNumber.replace(/\s+/g, '');
  
  // Validar longitud básica
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return { isValid: false, message: 'Longitud de tarjeta inválida' };
  }

  // Validar que solo contenga números
  if (!/^\d+$/.test(cleanNumber)) {
    return { isValid: false, message: 'La tarjeta solo debe contener números' };
  }

  // Validar con algoritmo de Luhn
  if (!luhnCheck(cleanNumber)) {
    return { isValid: false, message: 'Número de tarjeta inválido' };
  }

  // Identificar tipo de tarjeta
  const cardPatterns = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
  };

  let cardType = 'unknown';
  for (const [type, pattern] of Object.entries(cardPatterns)) {
    if (pattern.test(cleanNumber)) {
      cardType = type;
      break;
    }
  }

  return { 
    isValid: true, 
    message: 'Tarjeta válida',
    type: cardType,
    last4: cleanNumber.slice(-4)
  };
};

// Función para validar fecha de expiración
const validateExpiration = (expiration) => {
  const expRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!expRegex.test(expiration)) {
    return { isValid: false, message: 'Formato de fecha inválido (MM/AA)' };
  }

  const [month, year] = expiration.split('/');
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (parseInt(year) < currentYear || 
      (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
    return { isValid: false, message: 'Tarjeta expirada' };
  }

  return { isValid: true, message: 'Fecha válida' };
};

// Función para validar email de PayPal
const validatePayPalEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Email de PayPal inválido' };
  }
  return { isValid: true, message: 'Email válido' };
};

// Función para validar referencia de transferencia
const validateTransferencia = (referencia) => {
  if (!referencia || referencia.trim().length < 5) {
    return { isValid: false, message: 'La referencia debe tener al menos 5 caracteres' };
  }
  return { isValid: true, message: 'Referencia válida' };
};

const purchaseController = {
  // Realizar compra
  createPurchase: async (req, res) => {
    try {
      const { libroId, metodoPago, cardData, paypalData, transferenciaData } = req.body;

      // Validar campos requeridos
      if (!libroId) {
        return res.status(400).json({
          success: false,
          message: 'ID del libro es requerido'
        });
      }

      if (!metodoPago) {
        return res.status(400).json({
          success: false,
          message: 'Método de pago es requerido'
        });
      }

      // Validar método de pago soportado
      const metodosSoportados = ['tarjeta', 'paypal', 'transferencia'];
      if (!metodosSoportados.includes(metodoPago)) {
        return res.status(400).json({
          success: false,
          message: 'Método de pago no soportado'
        });
      }

      // Verificar si el libro existe
      const book = await Book.findOne({ _id: libroId, activo: true });
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Libro no encontrado'
        });
      }

      // Verificar si el usuario ya compró el libro
      const existingPurchase = await Purchase.findOne({
        usuario: req.user._id,
        libro: libroId
      });

      if (existingPurchase) {
        return res.status(400).json({
          success: false,
          message: 'Ya has comprado este libro'
        });
      }

      // Validaciones específicas por método de pago
      if (metodoPago === 'tarjeta') {
        if (!cardData) {
          return res.status(400).json({
            success: false,
            message: 'Datos de tarjeta requeridos'
          });
        }

        // Validar campos de tarjeta
        if (!cardData.numero || !cardData.expiracion || !cardData.cvv || !cardData.nombre) {
          return res.status(400).json({
            success: false,
            message: 'Todos los campos de la tarjeta son requeridos'
          });
        }

        // Validar tarjeta
        const cardValidation = validateCard(cardData.numero);
        if (!cardValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: cardValidation.message
          });
        }

        // Validar fecha de expiración
        const expValidation = validateExpiration(cardData.expiracion);
        if (!expValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: expValidation.message
          });
        }

        // Validar CVV
        if (!/^[0-9]{3,4}$/.test(cardData.cvv)) {
          return res.status(400).json({
            success: false,
            message: 'CVV inválido (debe tener 3 o 4 dígitos)'
          });
        }

        // Validar nombre
        if (cardData.nombre.trim().length < 2) {
          return res.status(400).json({
            success: false,
            message: 'Nombre en la tarjeta es requerido'
          });
        }

        // Simular procesamiento de pago con tarjeta
        console.log('Procesando pago con tarjeta:', {
          tipo: cardValidation.type,
          ultimos4: cardValidation.last4,
          metodo: metodoPago,
          monto: book.precioFinal,
          usuario: req.user._id
        });

      } else if (metodoPago === 'paypal') {
        if (!paypalData) {
          return res.status(400).json({
            success: false,
            message: 'Datos de PayPal requeridos'
          });
        }

        // Validar email de PayPal
        const emailValidation = validatePayPalEmail(paypalData.email);
        if (!emailValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: emailValidation.message
          });
        }

        // Simular procesamiento de PayPal
        console.log('Procesando pago con PayPal:', {
          email: paypalData.email,
          metodo: metodoPago,
          monto: book.precioFinal,
          usuario: req.user._id
        });

      } else if (metodoPago === 'transferencia') {
        if (!transferenciaData) {
          return res.status(400).json({
            success: false,
            message: 'Datos de transferencia requeridos'
          });
        }

        // Validar referencia de transferencia
        const transferValidation = validateTransferencia(transferenciaData.referencia);
        if (!transferValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: transferValidation.message
          });
        }

        // Simular procesamiento de transferencia
        console.log('Procesando transferencia:', {
          referencia: transferenciaData.referencia,
          metodo: metodoPago,
          monto: book.precioFinal,
          usuario: req.user._id
        });
      }

      // Crear la compra
      const purchase = new Purchase({
        usuario: req.user._id,
        libro: libroId,
        precioPagado: book.precioFinal,
        metodoPago: metodoPago,
        estado: 'completado'
      });

      await purchase.save();

      // Populate para enviar datos del libro
      await purchase.populate('libro', 'titulo autor portada formato ebook sinopsis paginas editorial categoria');

      res.status(201).json({
        success: true,
        message: 'Compra realizada exitosamente',
        data: { 
          purchase: {
            _id: purchase._id,
            fechaCompra: purchase.fechaCompra,
            precioPagado: purchase.precioPagado,
            metodoPago: purchase.metodoPago,
            estado: purchase.estado,
            libro: purchase.libro
          }
        }
      });

    } catch (error) {
      console.error('Error realizando compra:', error);
      
      // Manejar error de duplicado
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Ya has comprado este libro'
        });
      }

      // Manejar error de ObjectId inválido
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID del libro inválido'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener compras del usuario
  getUserPurchases: async (req, res) => {
    try {
      const purchases = await Purchase.find({ 
        usuario: req.user._id,
        estado: 'completado'
      })
        .populate('libro', 'titulo autor portada formato categoria precioFinal ebook sinopsis paginas editorial')
        .sort({ fechaCompra: -1 });

      res.json({
        success: true,
        data: { 
          purchases: purchases.map(purchase => ({
            _id: purchase._id,
            fechaCompra: purchase.fechaCompra,
            precioPagado: purchase.precioPagado,
            metodoPago: purchase.metodoPago,
            libro: purchase.libro
          }))
        }
      });

    } catch (error) {
      console.error('Error obteniendo compras:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Verificar si usuario compró un libro específico
  checkBookPurchase: async (req, res) => {
    try {
      const { libroId } = req.params;

      if (!libroId) {
        return res.status(400).json({
          success: false,
          message: 'ID del libro es requerido'
        });
      }

      const purchase = await Purchase.findOne({
        usuario: req.user._id,
        libro: libroId,
        estado: 'completado'
      });

      res.json({
        success: true,
        data: { 
          comprado: !!purchase,
          purchase: purchase ? {
            _id: purchase._id,
            fechaCompra: purchase.fechaCompra
          } : null
        }
      });

    } catch (error) {
      console.error('Error verificando compra:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID del libro inválido'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener detalles de una compra específica
  getPurchaseDetail: async (req, res) => {
    try {
      const { purchaseId } = req.params;

      const purchase = await Purchase.findOne({
        _id: purchaseId,
        usuario: req.user._id
      }).populate('libro', 'titulo autor portada formato categoria precioFinal ebook sinopsis paginas editorial');

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: 'Compra no encontrada'
        });
      }

      res.json({
        success: true,
        data: { purchase }
      });

    } catch (error) {
      console.error('Error obteniendo detalle de compra:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de compra inválido'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = purchaseController;