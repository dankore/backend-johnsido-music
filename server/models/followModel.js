const usersCollection = require('../../db').db().collection('users');
const followsCollection = require('../../db').db().collection('follows');
// eslint-disable-next-line prettier/prettier
const { ObjectID } = require('mongodb');

let Follow = class follow {
  constructor(followedUsername, followerId) {
    this.followedUsername = followedUsername;
    this.followerId = followerId;
    this.errors = [];
  }
};

Follow.prototype.validate = async function (type) {
  // DON'T FOLLOW A USER IF THEY ARE NOT REGISTERED
  const followedAccount = await usersCollection.findOne({
    username: this.followedUsername,
  });
  if (followedAccount) {
    this.followedId = followedAccount._id;
  } else {
    this.errors.push('This user does not exists');
  }

  // DON'T FOLLOW A USER IF THEY ARE ALREADY BEING FOLLOWED
  const isFollowed = await followsCollection.findOne({
    followedId: this.followedId,
    followerId: new ObjectID(this.followerId),
  });

  if (type == 'followUser') {
    if (isFollowed) {
      this.errors.push('You are already following this user.');
    }
  }

  // USER SHOULD NOT FOLLOW THEMSELVES
  if (this.followedId === this.followerId) {
    this.errors.push('You cannot follow yourself.');
  }
};

Follow.prototype.cleanUp = function () {
  if (typeof this.followedUsername != 'string') {
    this.followedUsername = '';
  }
};

Follow.prototype.followUser = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    await this.validate('followUser');

    // SAVE
    if (!this.errors.length) {
      await followsCollection.insertOne({
        followedId: this.followedId,
        followerId: new ObjectID(this.followerId),
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

module.exports = Follow;
