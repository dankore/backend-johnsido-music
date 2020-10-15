const express = require('express');
const apiRouter = express.Router();
const userController = require('./controllers/userController');
const followController = require('./controllers/followController');
const commentsController = require('./controllers/commentsController');
const adminController = require('./controllers/adminController');
const mySongsController = require('./controllers/mySongsController');

apiRouter.get('/', (req, res) => res.end('API - John Sido Music'));
apiRouter.post('/register', userController.apiRegister);
apiRouter.post('/doesEmailExists', userController.apiDoesEmailExists);
apiRouter.post('/doesUsernameExists', userController.apiDoesUsernameExists);

// AUTH
apiRouter.post(
  '/login',
  userController.addApiUserObjectToReqBody,
  userController.isActive,
  userController.apiLogin
);
apiRouter.post('/checkTokenExpiry', userController.apiCheckTokenExpiry);

// SETTINGS
apiRouter.post(
  '/saveUpdatedProfileInfo',
  userController.isLoggedIn,
  userController.apiSaveUpdatedProfileInfo
);
apiRouter.post(
  '/change-password',
  userController.isLoggedIn,
  userController.isActive,
  userController.apiChangePassword
);
apiRouter.post('/delete-account', userController.isLoggedIn, userController.apiDeleteAccount);

// PROFILE
apiRouter.post(
  '/profile/:username',
  userController.isUserRegistered,
  userController.sharedProfiledata,
  userController.profileBasicData
);

// FOLLOW
apiRouter.post(
  '/addFollow/:username',
  userController.isLoggedIn,
  userController.isActive,
  followController.apiFollowUser
);
apiRouter.post(
  '/stopFollowing/:username',
  userController.isLoggedIn,
  userController.isActive,
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
apiRouter.post(
  '/add-comment',
  userController.isLoggedIn,
  userController.isActive,
  commentsController.apiAddComment
);
apiRouter.post(
  '/delete-comment',
  userController.isLoggedIn,
  userController.isActive,
  commentsController.apiDeleteComment
);
apiRouter.post(
  '/edit-comment',
  userController.isLoggedIn,
  userController.isActive,
  commentsController.apiEditComment
);

// ADMIN
apiRouter.post(
  '/admin-stats/:username',
  userController.isLoggedIn,
  userController.isAdmin,
  adminController.adminStats,
  adminController.apiGetAdminStats
);
apiRouter.post(
  '/admin/:username/userToAdmin_AdminToUser',
  userController.isLoggedIn,
  userController.isActive,
  userController.isAdmin,
  adminController.apiHandleRoleAssignment
);
apiRouter.post(
  '/admin/:username/activateDeactivateAccount',
  userController.isLoggedIn,
  userController.isActive,
  userController.isAdmin,
  adminController.apiHandleBanUser
);
apiRouter.post(
  '/admin/:username/search',
  userController.isLoggedIn,
  userController.isAdmin,
  adminController.apiAdminSearch
);
apiRouter.post(
  '/admin/:username/uploadSong',
  userController.isLoggedIn,
  userController.isActive,
  userController.isAdmin,
  adminController.apiUploadSong
);

apiRouter.get('/my-songs', mySongsController.apiFetchMySongs)

module.exports = apiRouter;
