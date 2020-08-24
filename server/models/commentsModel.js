const commentsCollection = require('../../db').db().collection('comments');
const { ObjectID } = require('mongodb');

const Comments = class comments {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }
};

Comments.reUseableQuery = function (uniqueOperations) {
  return new Promise(async resolve => {
    const aggOperations = uniqueOperations.concat([
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorDoc',
        },
      },
      {
        $project: {
          comment: 1,
          author: { $arrayElemAt: ['$authorDoc', 0] },
        },
      },
    ]);

    let comments = await commentsCollection.aggregate(aggOperations).toArray();

    // CLEAN UP AUTHOR
    comments = comments.map(comment => {
      comment.author = {
        username: comment.author.username,
        firstName: comment.author.firstName,
        lastName: comment.author.lastName,
        avatar: comment.author.avatar,
      };

      return comment;
    });

    resolve(comments);
  });
};

Comments.fetchComments = id => {
  return new Promise(async (resolve, reject) => {
    try {
      let comments = await commentsCollection.find({ profileOwner: new ObjectID(id) }).toArray();

      comments = comments.map(comment => {
        return comment.author;
      });

      // LOOK UP THE USER AND COMMENT INFO OF COMMENT AUTHORS
      const results = await Comments.reUseableQuery([{ $match: { author: { $in: comments } } }]);

      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

Comments.countCommentsById = id => {
  return new Promise(async resolve => {
    const commentsCount = await commentsCollection.countDocuments({
      profileOwner: id,
    });

    resolve(commentsCount);
  });
};

module.exports = Comments;
