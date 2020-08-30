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

  if (type == 'stopFollowing') {
    if (!isFollowed) {
      this.errors('You are not following this user.');
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

Follow.prototype.stopFollowingUser = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    await this.validate('stopFollowing');

    // STOP FOLLWOING
    if (!this.errors.length) {
      await followsCollection.deleteOne({
        followedId: this.followedId,
        followerId: new ObjectID(this.followerId),
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

Follow.isUserFollowingVisitedProfile = async (followedId, followerId) => {
  const followDoc = await followsCollection.findOne({
    followedId: followedId,
    followerId: new ObjectID(followerId),
  });

  return followDoc ? true : false;
};

Follow.countFollowersById = id => {
  return new Promise(async resolve => {
    const followerCount = await followsCollection.countDocuments({
      followedId: id,
    });
    resolve(followerCount);
  });
};

Follow.countFollowingById = id => {
  return new Promise(async resolve => {
    const followingCount = await followsCollection.countDocuments({
      followerId: id,
    });
    resolve(followingCount);
  });
};

Follow.reUseableQuery = function (uniqueOperations, visitedProfileId, loggedInUserId) {
  return new Promise(async (resolve, reject) => {
    try {
      const aggOperations = uniqueOperations.concat([
        {
          $lookup: {
            from: 'users',
            localField: 'followerId',
            foreignField: '_id',
            as: 'authorDoc',
          },
        },
        {
          $project: {
            followedId: 1,
            author: { $arrayElemAt: ['$authorDoc', 0] },
          },
        },
      ]);

      let followers = await followsCollection.aggregate(aggOperations).toArray();

      const promises = followers.map(async follower => {
        if (new ObjectID(follower.followedId).equals(new ObjectID(visitedProfileId))) {
          // IS VISITED PROFILE OWNER FOLLOWING THIS AUTHOR?
          return Follow.isUserFollowingVisitedProfile(follower.author._id, loggedInUserId).then(
            results => {
              follower.loggedInUserFollowsVisitedUser = results;
              follower.author = {
                username: follower.author.username,
                firstName: follower.author.firstName,
                lastName: follower.author.lastName,
                avatar: follower.author.avatar,
                about: follower.author.about,
              };

              return follower;
            }
          );
        }
      });

      Promise.all(promises).then(results => resolve(results));

      // resolve(followers);
    } catch (error) {
      reject(error);
    }
  });
};

Follow.getFollowers = (visitedProfileId, loggedInUserId) => {
  return new Promise(async (resolve, reject) => {
    console.log({ loggedInUserId });
    try {
      let followers = await followsCollection
        .find({ followedId: new ObjectID(visitedProfileId) })
        .toArray();

      // GET ONLY THE FOLLOWERS IDS OF PROFILE @visitedProfileId
      followers = followers.map(follow => {
        return follow.followerId;
      });

      const results = await Follow.reUseableQuery(
        [{ $match: { followerId: { $in: followers } } }],
        visitedProfileId,
        loggedInUserId
      );

      resolve({ status: 'Success', followers: results });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = Follow;
