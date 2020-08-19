const Follow = require('../models/followModel');

exports.apiFollowUser = (req, res) => {
  let follow = new Follow(req.params.username, req.apiUser._id);
  console.log(follow);
  follow
    .followUser()
    .then(() => {
      res.json(true);
    })
    .catch(errors => {
      res.json(errors);
    });
};
