const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

module.exports = (req, res, next) => {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.userId = jwt.verify(token, jwtSecret()).sub;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
