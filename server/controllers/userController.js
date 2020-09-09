const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Follow = require('../models/followModel');
const Comments = require('../models/commentsModel');
const tokenLasts = '30d';

exports.apiRegister = (req, res) => {
  let user = new User(req.body);

  user
    .register()
    .then(() => {
      res.json({
        token: jwt.sign(
          {
            _id: user.data._id,
            username: user.data.username,
            firstName: user.data.firstName,
            lastName: user.data.lastName,
            userCreationDate: user.data.userCreationDate,
          },
          process.env.JWTSECRET,
          {
            expiresIn: tokenLasts,
          }
        ),
        _id: user.data._id,
        username: user.data.username,
        firstName: user.data.firstName,
        lastName: user.data.lastName,
        verified: false,
        admin: false,
        about: {
          bio: '',
          city: '',
          musicCategory: '',
        },
        avatar:
          'https://res.cloudinary.com/my-nigerian-projects/image/upload/f_auto,q_auto/v1597076721/Others/john/default-avatar.jpg',
        userCreationDate: user.data.userCreationDate,
      });
    })
    .catch(error => {
      res.json(error);
    });
};

exports.apiLogin = (req, res) => {
  let user = new User(req.body);

  user
    .login()
    .then(() => {
      res.json({
        token: jwt.sign(
          {
            _id: user.data._id,
            username: user.data.username,
            firstName: user.data.firstName,
            lastName: user.data.lastName,
            userCreationDate: user.data.userCreationDate,
          },
          process.env.JWTSECRET,
          {
            expiresIn: tokenLasts,
          }
        ),
        _id: user.data._id,
        username: user.data.username,
        firstName: user.data.firstName,
        lastName: user.data.lastName,
        userCreationDate: user.data.userCreationDate,
        avatar: user.data.avatar,
        verified: user.data.verified,
        admin: user.data.admin,
        about: {
          bio: user.data.about.bio,
          city: user.data.about.city,
          musicCategory: user.data.about.musicCategory,
        },
      });
    })
    .catch(errors => {
      res.json(errors);
    });
};

exports.apiDoesEmailExists = async (req, res) => {
  try {
    const response = await User.findByEmail(req.body.email);

    // ONLY SEND A PROPERTY OF THE RESPONSE OBJECT. NO NEED TO SEND ALL OBJECT OVER THE WIRE
    res.json(response);
  } catch (error) {
    // FAIL SILENTLY
    console.log(error);
  }
};
exports.apiDoesUsernameExists = async (req, res) => {
  try {
    const response = await User.findByUsername(req.body.username);

    // ONLY SEND A PROPERTY OF THE RESPONSE OBJECT. NO NEED TO SEND ALL OBJECT OVER THE WIRE
    res.json(response);
  } catch (error) {
    // FAIL SILENTLY
    console.log(error);
  }
};
exports.isUserRegistered = (req, res, next) => {
  // USER EXISTS?
  User.findByUsername(req.params.username)
    .then(userDoc => {
      req.visitedProfile = userDoc;

      next();
    })
    .catch(error => {
      res.json(error);
    });
};
exports.sharedProfiledata = async (req, res, next) => {
  let viewerId, viewer;
  try {
    viewer = jwt.verify(req.body.token, process.env.JWTSECRET);
    viewerId = viewer._id;
  } catch {
    viewerId = 0;
  }

  req.isFollowing = await Follow.isUserFollowingVisitedProfile(req.visitedProfile._id, viewerId);

  const followerCountPromise = Follow.countFollowersById(req.visitedProfile._id);
  const followingCountPromise = Follow.countFollowingById(req.visitedProfile._id);
  const commentsCountPromise = Comments.countCommentsById(req.visitedProfile._id);
  const [followerCount, followingCount, commentsCount] = await Promise.all([
    followerCountPromise,
    followingCountPromise,
    commentsCountPromise,
  ]);

  req.followerCount = followerCount;
  req.followingCount = followingCount;
  req.commentsCount = commentsCount;

  next();
};
exports.profileBasicData = (req, res) => {
  if (req.visitedProfile) {
    res.json({
      profileId: req.visitedProfile._id,
      profileUsername: req.visitedProfile.username,
      profileFirstName: req.visitedProfile.firstName,
      profileLastName: req.visitedProfile.lastName,
      profileEmail: req.visitedProfile.email,
      profileAvatar: req.visitedProfile.avatar,
      profileAbout: req.visitedProfile.about,
      isFollowing: req.isFollowing,
      counts: {
        followerCount: req.followerCount,
        followingCount: req.followingCount,
        commentsCount: req.commentsCount,
      },
    });
  } else {
    res.json(false);
  }
};

exports.isLoggedIn = (req, res, next) => {
  try {
    req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET);

    next();
  } catch (error) {
    res.json(['You need to log in to perform this operation.']);
  }
};

exports.apiSaveUpdatedProfileInfo = (req, res) => {
  req.body.userData._id = req.apiUser._id;
  let user = new User(req.body.userData);

  user
    .saveUpdatedProfileInfo()
    .then(() => {
      res.json({
        token: jwt.sign(
          {
            _id: req.apiUser._id,
            username: user.data.username,
            firstName: user.data.firstName,
            lastName: user.data.lastName,
            userCreationDate: user.data.userCreationDate,
          },
          process.env.JWTSECRET,
          {
            expiresIn: tokenLasts,
          }
        ),
      });
    })
    .catch(error => {
      res.json(error);
    });
};

exports.apiChangePassword = (req, res) => {
  req.body._id = req.apiUser._id; // ATTACH _ID TO BODY. THIS IS USED TO FIND A USER.
  let user = new User(req.body);

  user
    .changePassword()
    .then(response => {
      // SUCCESS
      res.json(response);
    })
    .catch(errors => {
      res.json(errors);
    });
};

exports.apiDeleteAccount = (req, res) => {
  User.deleteAccount(req.apiUser._id)
    .then(response => {
      res.json(response);
    })
    .catch(error => {
      res.json(error);
    });
};
