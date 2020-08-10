const express = require('express');
const apiRouter = express.Router();
const userController = require('./controllers/userController');

apiRouter.get('/', (req, res) => res.end('Api John Sido Music'));
apiRouter.post('/register', userController.apiRegister);
apiRouter.post('/doesEmailExists', userController.apiDoesEmailExists);

module.exports = apiRouter;
