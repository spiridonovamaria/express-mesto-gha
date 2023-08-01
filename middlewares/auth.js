const jwt = require('jsonwebtoken');
const Unauthorized = require('../errors/autherror');

function auth(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer: ')) {
    throw new Unauthorized();
  }
  const token = authorization.replace('Bearer: ', '');
  let payload;
  try {
    payload = jwt.verify(token, 'super-strong-secret');
  } catch (err) {
    throw new Unauthorized();
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
  return null;
}
module.exports = auth;
