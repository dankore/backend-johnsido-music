const express = require('express');
const apiRouter = express.Router();
const userController = require('./controllers/userController');
const followController = require('./controllers/followController');
const commentsController = require('./controllers/commentsController');
const adminController = require('./controllers/adminController');

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
apiRouter.post('/delete-account', userController.isLoggedIn, userController.apiDeleteAccount);

// PROFILE
apiRouter.post(
  '/profile/:username',
  userController.isUserRegistered,
  userController.sharedProfiledata,
  userController.profileBasicData
);

// FOLLOW
apiRouter.post('/addFollow/:username', userController.isLoggedIn, followController.apiFollowUser);
apiRouter.post(
  '/stopFollowing/:username',
  userController.isLoggedIn,
  followController.apiStopFollowingUser
);
apiRouter.post(
  '/profile/:username/followers',
  userController.isUserRegistered,
  followController.apiFetchFollowers
);
apiRouter.post(
  '/profile/:username/following',
  userController.isUserRegistered,
  followController.apiFetchFollowing
);

// COMMENTS
apiRouter.post(
  '/profile/:username/comments',
  userController.isUserRegistered,
  commentsController.apiFetchComments
);
apiRouter.post('/add-comment', userController.isLoggedIn, commentsController.apiAddComment);
apiRouter.post('/delete-comment', userController.isLoggedIn, commentsController.apiDeleteComment);
apiRouter.post('/edit-comment', userController.isLoggedIn, commentsController.apiEditComment);

// ADMIN
apiRouter.post(
  '/admin-stats/:username',
  userController.isLoggedIn,
  userController.isAdmin,
  adminController.adminStats,
  adminController.apiGetAdminStats
);
apiRouter.post(
  '/admin/:username/downgradeAdminToUser',
  userController.isLoggedIn,
  userController.isAdmin,
  adminController.apiDowngradeAdminToUser
);

module.exports = apiRouter;
