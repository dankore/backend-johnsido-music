const express = require('express');
const apiRouter = express.Router();
const userController = require('./controllers/userController');

apiRouter.get('/', (req, res) => res.end('Api John Sido Music'));
apiRouter.post('/register', userController.apiRegister);

module.exports = apiRouter;
