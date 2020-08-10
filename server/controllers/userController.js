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
    console.log({ response });
    res.json(response);
  } catch (error) {
    // FAIL SILENTLY
    console.log(error);
  }
};
