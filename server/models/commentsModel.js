const commentsCollection = require('../../db').db().collection('comments');
const usersCollection = require('../../db').db().collection('users');
const { ObjectID } = require('mongodb');

const Comments = class comments {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }
};

Comments.reUseableQuery = function (uniqueOperations, profileOwnerId) {
  return new Promise(async (resolve, reject) => {
    try {
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
            profileOwner: 1,
            comment: 1,
            author: { $arrayElemAt: ['$authorDoc', 0] },
          },
        },
      ]);

      let comments = await commentsCollection.aggregate(aggOperations).toArray();

      // CLEAN UP
      comments = comments.filter(comment => {
        if (comment.profileOwner.equals(profileOwnerId)) {
          comment.author = {
            username: comment.author.username,
            firstName: comment.author.firstName,
            lastName: comment.author.lastName,
            avatar: comment.author.avatar,
          };
          return comment;
        }
      });

      resolve(comments);
    } catch (error) {
      reject(error);
    }
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
      const results = await Comments.reUseableQuery(
        [{ $match: { author: { $in: comments } } }, { $sort: { _id: -1 } }],
        id
      );

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
};

Comments.prototype.validate = function (type) {
  return new Promise(async (resolve, reject) => {
    if (this.data.comment == '') {
      this.errors.push('Comment field is empty.');
    }
    // CHECK FOR OWNERSHIP
    if (this.profileOwner && this.profileOwner != this.apiUser) {
      this.errors.push('You do no have the permission to perform that action.');
    }

    const userDoc = await usersCollection.findOne({ username: this.data.profileOwner });
    if (userDoc) {
      this.data.profileOwner = userDoc._id;
    } else {
      reject('No account with this username exists.');
    }

    // CLEAN UP
    this.data = {
      ...(type == 'add' && { author: ObjectID(this.data.author) }),
      ...(type == 'add' && {
        comment: [{ text: this.data.comment, createdDate: this.data.createdDate }],
      }),
      ...(type == 'add' && { profileOwner: this.data.profileOwner }),
      ...(type == 'edit' && {
        comment: { text: this.data.comment, createdDate: this.data.createdDate },
      }),
      ...(type == 'edit' && { commentId: this.data.commentId }),
    };

    resolve();
  });
};

Comments.prototype.add = function () {
  return new Promise(async (resolve, reject) => {
    try {
      this.cleanUp();
      await this.validate('add');

      if (!this.errors.length) {
        const { insertedId } = await commentsCollection.insertOne(this.data);

        // GET COMMENT AND AUTHOR DETAILS
        const result = await Comments.reUseableQuery(
          [{ $match: { _id: new ObjectID(insertedId) } }],
          this.data.profileOwner
        );

        resolve(result[0]);
      } else {
        reject(this.errors);
      }
    } catch (error) {
      reject(error);
    }
  });
};

Comments.delete = id => {
  return new Promise(async (resolve, reject) => {
    try {
      await commentsCollection.findOneAndDelete({ _id: new ObjectID(id) });
      resolve('Success');
    } catch (error) {
      reject('Delete failed');
    }
  });
};

Comments.prototype.edit = function () {
  return new Promise(async (resolve, reject) => {
    try {
      this.cleanUp();
      await this.validate('edit');

      if (!this.errors.length) {
        const commentDoc = await commentsCollection.findOneAndUpdate(
          {
            _id: new ObjectID(this.data.commentId),
          },
          {
            $push: {
              comment: this.data.comment,
            },
          },
          {
            returnOriginal: false,
          }
        );

        resolve(commentDoc.value.comment);
      } else {
        reject(this.errors);
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = Comments;
