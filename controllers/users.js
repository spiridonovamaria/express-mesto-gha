const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');
const NotFound = require('../errors/NotFound');
const Unauthorized = require('../errors/autherror');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};
const getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send({
          data: user,
        });
      } else {
        next(new NotFound('Пользователь не найден'));
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequest('Переданы некорректные данные пользователя'));
      } return next(error);
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(201).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные'));
      } else if (error.name === 'MongoError' || error.code === 11000) {
        next(new Conflict('Пользователь с таким email уже зарегистрирован'));
      } else {
        next(error);
      }
    });
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.status(200).send({
          data: user,
        });
      } else {
        next(new NotFound('Пользователь не найден'));
      }
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(new BadRequest('Переданы некорректные данные пользователя'));
      } return next(error);
    });
};

const editAvatarUser = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.status(200).send({
          data: user,
        });
      } else {
        next(new NotFound('Пользователь не найден'));
      }
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(new BadRequest('Переданы некорректные данные пользователя'));
      } return next(error);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new Unauthorized('Неправильные почта или пароль');
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new Unauthorized('Неправильные почта или пароль');
        }

        const token = jwt.sign({ _id: user._id }, 'some-secret-key', {
          expiresIn: '7d',
        });

        return res.send({ token });
      });
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  const { _id } = req.user;

  User.findById(_id)
    .orFail(() => next(new NotFound('Пользователь c указанным id не найден')))
    .then((user) => res.send(user))
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequest('Передача некорректного id'));
      } else {
        next(error);
      }
    });
};
module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  editAvatarUser,
  login,
  getCurrentUser,
};
