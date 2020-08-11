const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

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
          { expiresIn: '30d' }
        ),
        _id: user.data._id,
        username: user.data.username,
        firstName: user.data.firstName,
        lastName: user.data.lastName,
        verified: false,
        avatar:
          'https://res.cloudinary.com/my-nigerian-projects/image/upload/f_auto,q_auto/v1597076721/Others/john/default-avatar.jpg',
        userCreationDate: user.data.userCreationDate,
      });
    })
    .catch(error => {
      res.json(error);
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
