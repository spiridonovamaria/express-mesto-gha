const router = require('express').Router();
const { Joi, celebrate } = require('celebrate');
const {
  getUsers,
  getUser,
  updateUser,
  editAvatarUser,
  getCurrentUser,
} = require('../controllers/users');

const urlPattern = /^(https?:\/\/)?([а-я0-9_-]{1,32}|[a-z0-9_-]{1,32})\.([а-я0-9_-]{1,8}|[a-z0-9_-]\S{1,8})$/i;

router.get('/users', getUsers);
router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().hex().length(24).required(),
  }),
}), getUser);
router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUser);
router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(urlPattern),
  }),
}), editAvatarUser);
router.get('/users/me', getCurrentUser);

module.exports = router;
