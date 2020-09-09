const Follow = require('../models/followModel');

exports.apiFollowUser = (req, res) => {
  let follow = new Follow(req.params.username, req.apiUser._id);

  follow
    .followUser()
    .then(() => {
      res.json(true);
    })
    .catch(errors => {
      res.json(errors);
    });
};

exports.apiStopFollowingUser = (req, res) => {
  let follow = new Follow(req.params.username, req.apiUser._id);
  console.log(follow);

  follow
    .stopFollowingUser()
    .then(() => {
      res.json(true);
    })
    .catch(() => [res.json(false)]);
};

exports.apiFetchFollowers = (req, res) => {
  Follow.getFollowers(req.visitedProfile._id, req.body.loggedInUserId)
    .then(response => {
      res.json(response);
    })
    .catch(error => {
      res.json(error);
    });
};

exports.apiFetchFollowing = (req, res) => {
  Follow.getFollowing(req.visitedProfile._id, req.body.loggedInUserId)
    .then(response => {
      res.json(response);
    })
    .catch(error => {
      res.json(error);
    });
};
