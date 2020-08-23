const Comments = require('../models/commentsModel');

exports.apiFetchComments = (req, res) => {
  Comments.fetchComments('5f34ce62026d250eb88342a3')
    .then(response => {
      res.json(response);
    })
    .catch(errors => {
      res.json(errors);
    });
};
