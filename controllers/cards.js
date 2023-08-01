const Card = require('../models/card');
const BadRequest = require('../errors/BadRequest');
const NotFound = require('../errors/NotFound');
const Forbidden = require('../errors/Forbidden');

const getInitialCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

const addCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send(card))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(new BadRequest('Переданы некорректные данные при добавлении карточки'));
      } return next(error);
    });
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFound('Запрашиваемая карточка не найдена');
      }
      if (card.owner.toString() !== req.user._id) {
        throw new Forbidden('Удаление запрещено');
      }
      return Card.deleteOne(card)
        .then(() => res.status(200).send({ message: 'Карточка удалена' }));
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequest('Некорректные данные'));
      } return next(error);
    });
};

const addLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        return res.status(200).send(card);
      }
      throw new NotFound('Запрашиваемая карточка не найдена');
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequest('Некорректные данные'));
      } return next(error);
    });
};

const deleteLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFound('Не найдена запрашиваемая карточка');
      } return res.status(200).send(card);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequest('Некорректные данные'));
      } return next(error);
    });
};

module.exports = {
  getInitialCards,
  addCard,
  deleteCard,
  addLike,
  deleteLike,
};
