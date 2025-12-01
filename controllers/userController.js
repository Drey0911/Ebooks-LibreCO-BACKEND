const User = require('../models/User');

const userController = {
  // Obtener todos los usuarios (solo para admin)
  getUsers: async (req, res) => {
    try {
      const users = await User.find()
        .select('-__v')
        .sort({ fechaRegistro: -1 });

      res.json({
        success: true,
        data: {
          users,
          total: users.length
        }
      });
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar perfil de usuario
  updateProfile: async (req, res) => {
    try {
      const { nombres, apellidos, telefono } = req.body;
      const userId = req.user._id;

      const user = await User.findByIdAndUpdate(
        userId,
        { 
          nombres, 
          apellidos, 
          telefono,
          ultimoAcceso: new Date()
        },
        { new: true, runValidators: true }
      ).select('-__v');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          user: {
            id: user._id,
            nombres: user.nombres,
            apellidos: user.apellidos,
            email: user.email,
            telefono: user.telefono
          }
        }
      });
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = userController;