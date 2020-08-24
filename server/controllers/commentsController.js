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
