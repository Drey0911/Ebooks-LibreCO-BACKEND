const Book = require('../models/Book');
const Purchase = require('../models/Purchase');

const bookController = {
  // Crear nuevo libro (protegido para admin)
  createBook: async (req, res) => {
    try {
      const {
        titulo,
        sinopsis,
        portada,
        autor,
        paginas,
        isbn,
        editorial,
        fechaLanzamiento,
        formato,
        categoria,
        precio,
        promocional,
        oferta,
        ebook
      } = req.body;

      // Verificar si el ISBN ya existe
      const existingBook = await Book.findOne({ isbn });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: 'El ISBN ya está registrado'
        });
      }

      const book = new Book({
        titulo,
        sinopsis,
        portada,
        autor,
        paginas,
        isbn,
        editorial,
        fechaLanzamiento,
        formato,
        categoria,
        precio,
        promocional: promocional || 0,
        oferta: oferta || 0,
        ebook
      });

      await book.save();

      res.status(201).json({
        success: true,
        message: 'Libro creado exitosamente',
        data: { book }
      });

    } catch (error) {
      console.error('Error creando libro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener todos los libros (público)
  getAllBooks: async (req, res) => {
    try {
      const { categoria, promocional, page = 1, limit = 10 } = req.query;
      
      const filter = { activo: true };
      
      if (categoria) {
        filter.categoria = new RegExp(categoria, 'i');
      }
      
      if (promocional !== undefined) {
        filter.promocional = parseInt(promocional);
      }

      const books = await Book.find(filter)
        .select('-ebook')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Book.countDocuments(filter);

      res.json({
        success: true,
        data: {
          books,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total
        }
      });

    } catch (error) {
      console.error('Error obteniendo libros:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener libro por ID (público pero sin ebook)
  getBookById: async (req, res) => {
    try {
      const book = await Book.findOne({ 
        _id: req.params.id, 
        activo: true 
      }).select('-ebook');

      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Libro no encontrado'
        });
      }

      res.json({
        success: true,
        data: { book }
      });

    } catch (error) {
      console.error('Error obteniendo libro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener detalles completos del libro (incluye ebook si el usuario lo compró)
  getBookDetails: async (req, res) => {
    try {
      const book = await Book.findOne({ 
        _id: req.params.id, 
        activo: true 
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Libro no encontrado'
        });
      }

      // Verificar si el usuario compró el libro
      const purchase = await Purchase.findOne({
        usuario: req.user._id,
        libro: req.params.id,
        estado: 'completado'
      });

      const bookData = book.toObject();
      
      // Si no lo compró, eliminar el campo ebook de la respuesta
      if (!purchase) {
        delete bookData.ebook;
      }

      res.json({
        success: true,
        data: { 
          book: bookData,
          comprado: !!purchase 
        }
      });

    } catch (error) {
      console.error('Error obteniendo detalles del libro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener libros en promoción (público)
  getPromotionalBooks: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const books = await Book.find({ 
        promocional: 1, 
        activo: true 
      })
      .select('-ebook')
      .sort({ precioFinal: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      const total = await Book.countDocuments({ 
        promocional: 1, 
        activo: true 
      });

      res.json({
        success: true,
        data: {
          books,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total
        }
      });

    } catch (error) {
      console.error('Error obteniendo libros promocionales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Filtrar libros por categoría (público)
  getBooksByCategory: async (req, res) => {
    try {
      const { categoria } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const books = await Book.find({ 
        categoria: new RegExp(categoria, 'i'),
        activo: true 
      })
      .select('-ebook')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      const total = await Book.countDocuments({ 
        categoria: new RegExp(categoria, 'i'),
        activo: true 
      });

      res.json({
        success: true,
        data: {
          books,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total
        }
      });

    } catch (error) {
      console.error('Error obteniendo libros por categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar libro (protegido para admin)
  updateBook: async (req, res) => {
    try {
      const book = await Book.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Libro no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Libro actualizado exitosamente',
        data: { book }
      });

    } catch (error) {
      console.error('Error actualizando libro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Eliminar libro (protegido para admin)
  deleteBook: async (req, res) => {
    try {
      const book = await Book.findByIdAndUpdate(
        req.params.id,
        { activo: false },
        { new: true }
      );

      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Libro no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Libro eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando libro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = bookController;