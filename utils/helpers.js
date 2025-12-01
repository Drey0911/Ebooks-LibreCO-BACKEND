// Funciones auxiliares
const formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  const { __v, supabaseUserId, ...sanitizedUser } = userObj;
  return sanitizedUser;
};

module.exports = {
  formatResponse,
  sanitizeUser
};