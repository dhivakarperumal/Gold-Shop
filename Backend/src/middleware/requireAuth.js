const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization && authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (!req.user.user_id) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid or expired authentication token' });
    }
    return next(error);
  }
}

module.exports = requireAuth;
