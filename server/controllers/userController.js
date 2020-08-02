const User = require('../models/userModel');

exports.homepage = (req, res) => {
  let user = new User({ name: 'adamu' });
  req.user = 'hi';

  user
    .register()
    .then(response => {
      res.json(response);
    })
    .catch(error => {
      console.log(error);
    });
};
