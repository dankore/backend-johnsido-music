const Comments = require('../models/commentsModel');

exports.apiFetchComments = (req, res) => {
  Comments.fetchComments(req.visitedProfile._id)
    .then(response => {
      res.json(response);
    })
    .catch(errors => {
      res.json(errors);
    });
};

exports.apiAddComment = (req, res) => {
  const comment = new Comments(req.body);

  comment
    .add()
    .then(response => {
      res.json(response);
    })
    .catch(errors => {
      res.json(errors);
    });
};

exports.apiDeleteComment = (req, res) => {
  if (req.apiUser.username == req.body.apiUser) {
    Comments.delete(req.body.commentId)
      .then(response => {
        res.json(response);
      })
      .catch(error => {
        res.json(error);
      });
  } else {
    res.json('You do not have permission to delete this comment.');
  }
};

exports.apiEditComment = (req, res) => {
  let comment = new Comments(req.body);

  comment
    .edit()
    .then(response => {
      res.json(response);
    })
    .catch(error => {
      res.json(error);
    });
};
