const router = require('express').Router();

const {
  getInitialCards,
  addCard,
  deleteCard,
  addLike,
  deleteLike,
} = require('../controllers/cards');

router.get('/cards', getInitialCards);
router.post('/cards', addCard);
router.delete('/cards/:_id', deleteCard);
router.put('/cards/:_id/likes', addLike);
router.delete('/cards/:_id/likes', deleteLike);

module.exports = router;
