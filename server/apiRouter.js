const express = require('express');
const apiRouter = express.Router();
const userController = require('./controllers/userController');
const followController = require('./controllers/followController');

apiRouter.get('/', (req, res) => res.end('API - John Sido Music'));
apiRouter.post('/register', userController.apiRegister);
apiRouter.post('/doesEmailExists', userController.apiDoesEmailExists);
apiRouter.post('/doesUsernameExists', userController.apiDoesUsernameExists);

// AUTH
apiRouter.post('/login', userController.apiLogin);

// SETTINGS
apiRouter.post(
  '/saveUpdatedProfileInfo',
  userController.isLoggedIn,
  userController.apiSaveUpdatedProfileInfo
);
apiRouter.post('/change-password', userController.isLoggedIn, userController.apiChangePassword);
// PROFILE
apiRouter.post(
  '/profile/:username',
  userController.apiIsUserRegistered,
  userController.sharedProfiledata,
  userController.profileBasicData
);

// FOLLOW
apiRouter.post('/addFollow/:username', userController.isLoggedIn, followController.apiFollowUser);

module.exports = apiRouter;
