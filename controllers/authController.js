const supabase = require('../config/supabase');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authController = {
  // Registro de usuario
  register: async (req, res) => {
    try {
      const { nombres, apellidos, email, telefono, password } = req.body;

      // Registrar usuario en Supabase Auth
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombres,
            apellidos,
            telefono
          }
        }
      });

      if (supabaseError) {
        console.error('Error Supabase:', supabaseError);
        return res.status(400).json({
          success: false,
          message: supabaseError.message
        });
      }

      // Guardar usuario en MongoDB
      const user = new User({
        supabaseUserId: supabaseData.user.id,
        nombres,
        apellidos,
        email,
        telefono
      });

      await user.save();

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: user._id,
          sub: supabaseData.user.id 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: user._id,
            nombres: user.nombres,
            apellidos: user.apellidos,
            email: user.email,
            telefono: user.telefono
          },
          token
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      
      // Si hay error en MongoDB, eliminar usuario de Supabase
      if (req.body.email) {
        await supabase.auth.admin.deleteUser(req.body.email);
      }

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Login de usuario
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Autenticar en Supabase
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (supabaseError) {
        console.error('Error Supabase login:', supabaseError);
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Buscar usuario en MongoDB y actualizar último acceso
      const user = await User.findOneAndUpdate(
        { supabaseUserId: supabaseData.user.id },
        { ultimoAcceso: new Date() },
        { new: true }
      ).select('-__v');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado en la base de datos'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: user._id,
          sub: supabaseData.user.id 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: user._id,
            nombres: user.nombres,
            apellidos: user.apellidos,
            email: user.email,
            telefono: user.telefono
          },
          token
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener perfil de usuario
  getProfile: async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          user: {
            id: req.user._id,
            nombres: req.user.nombres,
            apellidos: req.user.apellidos,
            email: req.user.email,
            telefono: req.user.telefono,
            fechaRegistro: req.user.fechaRegistro,
            ultimoAcceso: req.user.ultimoAcceso
          }
        }
      });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Cerrar sesión
  logout: async (req, res) => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error cerrando sesión en Supabase:', error);
      }

      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = authController;