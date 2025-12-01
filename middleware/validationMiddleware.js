const validateRegister = (req, res, next) => {
  const { nombres, apellidos, email, telefono, password} = req.body;

  if (!nombres || !apellidos || !email || !telefono || !password) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 8 caracteres, Mayúsculas, minúsculas, números y caracteres especiales'
    });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'El formato del email es inválido'
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email y contraseña son requeridos'
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin
};