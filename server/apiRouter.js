const express = require('express');
const apiRouter = express.Router();
const userController = require('./controllers/userController');

apiRouter.get('/', (req, res) => res.end('API - John Sido Music'));
apiRouter.post('/register', userController.apiRegister);
apiRouter.post('/doesEmailExists', userController.apiDoesEmailExists);
apiRouter.post('/doesUsernameExists', userController.apiDoesUsernameExists);

// AUTH
apiRouter.post('/login', userController.apiLogin);

module.exports = apiRouter;
