const jwt = require('jsonwebtoken');
const Unauthorized = require('../errors/autherror');

const JWT_SECRET = 'super-strong-secret';

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new Unauthorized('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(new Unauthorized('Необходима авторизация'));
  }

  req.user = payload;

  next();
};

module.exports = { auth };
