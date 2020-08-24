const commentsCollection = require('../../db').db().collection('comments');
const usersCollection = require('../../db').db().collection('users');
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

Comments.prototype.cleanUp = function () {
  if (typeof this.data.comment != 'string') {
    this.data.comment = '';
  }

  // CLEAN UP
  this.data = {
    author: this.data.author,
    comment: this.data.comment,
    profileOwner: this.data.profileOwner,
  };
};

Comments.prototype.validate = function () {
  return new Promise(async (resolve, reject) => {
    if (this.data.comment == '') {
      this.errors.push('Comment field is empty.');
    }

    const userDoc = await usersCollection.findOne({ username: this.data.profileOwner });
    if (userDoc) {
      this.data.profileOwner = userDoc._id;
    } else {
      reject('This username does not exist.');
    }

    resolve();
  });
};

Comments.prototype.add = function () {
  return new Promise(async (resolve, reject) => {
    try {
      this.cleanUp();
      await this.validate();

      console.log(this.data);
      if (!this.errors.length) {
        await commentsCollection.insertOne(this.data);
        resolve();
      } else {
        reject(this.errors);
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = Comments;
