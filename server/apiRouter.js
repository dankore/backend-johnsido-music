const express = require('express');
const apiRouter = express.Router();
const userController = require('./controllers/userController');

apiRouter.get('/', userController.homepage);

module.exports = apiRouter;
