const jwt = require('jsonwebtoken');
const Unauthorized = require('../errors/autherror');

const auth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return next(new Unauthorized('Необходима авторизация'));
  }

  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    return next(new Unauthorized('Необходима авторизация'));
  }

  req.user = payload;
  return next();
};

module.exports = auth;
