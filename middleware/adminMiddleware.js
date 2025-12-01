const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en admin middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error de autorización'
    });
  }
};

module.exports = adminMiddleware;