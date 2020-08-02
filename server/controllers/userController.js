const User = require('../models/userModel');

exports.homepage = (req, res) => {
  let user = new User('adamu is coolest');
  console.log(user);
  res.send('Hello');
};
