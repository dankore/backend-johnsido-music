const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
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
          { expiresIn: tokenLasts }
        ),
        _id: user.data._id,
        username: user.data.username,
        firstName: user.data.firstName,
        lastName: user.data.lastName,
        verified: false,
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
          { expiresIn: tokenLasts }
        ),
        _id: user.data._id,
        username: user.data.username,
        firstName: user.data.firstName,
        lastName: user.data.lastName,
        userCreationDate: user.data.userCreationDate,
        avatar: user.data.avatar,
        verified: user.data.verified,
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
    res.json(response && response.email);
  } catch (error) {
    // FAIL SILENTLY
    console.log(error);
  }
};
exports.apiDoesUsernameExists = async (req, res) => {
  try {
    const response = await User.findByUsername(req.body.username);
    // ONLY SEND A PROPERTY OF THE RESPONSE OBJECT. NO NEED TO SEND ALL OBJECT OVER THE WIRE
    res.json(response && response.email);
  } catch (error) {
    // FAIL SILENTLY
    console.log(error);
  }
};
exports.apiIsUserRegistered = (req, res, next) => {
  User.findByUsername(req.params.username)
    .then(userDoc => {
      req.profileUser = userDoc;
      next();
    })
    .catch(error => {
      res.json(error);
    });
};
exports.profileBasicData = (req, res) => {
  if (req.profileUser) {
    res.json({
      profileUsername: req.profileUser.username,
      profileFirstName: req.profileUser.firstName,
      profileLastName: req.profileUser.lastName,
      profileEmail: req.profileUser.email,
      profileAvatar: req.profileUser.avatar,
      profileAbout: req.profileUser.about,
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
    res.status(500).send('In order to perform this operation, you need to log in.');
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
          { expiresIn: tokenLasts }
        ),
      });
    })
    .catch(error => {
      res.json(error);
    });
};

exports.apiChangePassword = (req, res) => {
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
