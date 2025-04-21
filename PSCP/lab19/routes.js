const express = require('express');
const UserController = require('./controllers/userController');

const router = express.Router();

router.get('/', UserController.index);
router.get('/users/create', UserController.createForm);
router.post('/users/create', UserController.createUser);
router.get('/users/:id', UserController.show);

module.exports = router;
