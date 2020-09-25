const songsCollection = require('../../db').db().collection('songs');
const usersCollection = require('../../db').db().collection('users');
const { ObjectID } = require('mongodb');
const User = require('./userModel');

const Admin = class admin {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }
};

Admin.allUserDocs = () => {
  return new Promise(async resolve => {
    const allUserDocs = await usersCollection.find().toArray();

    //CLEAN USER DOCS
    allUserDocs.map(userDoc => {
      userDoc = {
        _id: userDoc._id,
        username: userDoc.username,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        verified: userDoc.verified,
        scope: userDoc.scope,
        avatar: userDoc.avatar,
        active: userDoc.active,
      };

      return userDoc;
    });

    resolve(allUserDocs);
  });
};

Admin.handleRoleAssignment = (userId, type) => {
  return new Promise(async (resolve, reject) => {
    try {
      await usersCollection.findOneAndUpdate(
        { _id: new ObjectID(userId) },
        {
          ...(type == 'downgrade' && {
            $pull: {
              scope: 'admin',
            },
          }),

          ...(type == 'upgrade' && {
            $push: {
              scope: 'admin',
            },
          }),
        }
      );

      resolve('Success');
    } catch (error) {
      reject(error);
    }
  });
};

Admin.handleBanUser = (userId, type) => {
  return new Promise(async (resolve, reject) => {
    try {
      await usersCollection.findOneAndUpdate(
        { _id: new ObjectID(userId) },
        {
          ...(type == 'inactivate' && { $set: { active: false } }),
          ...(type == 'activate' && { $set: { active: true } }),
        }
      );

      resolve('Success');
    } catch (error) {
      reject(error);
    }
  });
};

Admin.adminSearch = searchText => {
  return new Promise(async (resolve, reject) => {
    if (typeof searchText == 'string' && searchText != '') {
      const searchResults = await usersCollection
        .find(
          {
            $or: [
              {
                firstName: { $regex: new RegExp(searchText, 'i') },
              },
              {
                lastName: { $regex: new RegExp(searchText, 'i') },
              },
              {
                username: { $regex: new RegExp(searchText, 'i') },
              },
              {
                email: { $regex: new RegExp(searchText, 'i') },
              },
              {
                verified: { $regex: new RegExp(searchText, 'i') },
              },
              {
                active: { $regex: new RegExp(searchText, 'i') },
              },
              {
                scope: { $regex: new RegExp(searchText, 'i') },
              },
            ],
          },
          {
            $sort: { score: { $meta: 'textScore' } },
          }
        )
        .toArray();

      //CLEAN USER DOCS
      searchResults.map(userDoc => {
        userDoc = {
          _id: userDoc._id,
          username: userDoc.username,
          firstName: userDoc.firstName,
          lastName: userDoc.lastName,
          verified: userDoc.verified,
          scope: userDoc.scope,
          avatar: userDoc.avatar,
          active: userDoc.active,
        };

        return userDoc;
      });

      resolve(searchResults);
    } else {
      reject(['Must be a string.']);
    }
  });
};

Admin.prototype.validate = function () {
  // SONG URL
  let matchBaseUrl =
    this.data.songUrl &&
    this.data.songUrl.split('https://res.cloudinary.com/my-nigerian-projects/video/upload')[0] ==
      '';

  let matchLengthStringBeforeFileName =
    this.data.songUrl &&
    this.data.songUrl.split('audio')[1] &&
    this.data.songUrl.split('audio')[1].split('.')[0].length == 21;

  if (!matchBaseUrl || !matchLengthStringBeforeFileName) {
    this.errors.push('Invalid song url');
  }

  if (typeof this.data.songUrl != 'string') {
    this.data.songUrl = '';
  }
  // SONG TITLE
  if (this.data.songTitle.length < 3) {
    this.errors.push('Song title cannot be lower than 3 characters.');
  }
  if (this.data.songTitle.length > 150) {
    this.errors.push('Song title cannot exceed 150 characters.');
  }
  if (typeof this.data.songTitle != 'string') {
    this.data.songTitle = '';
  }
};

Admin.prototype.cleanUp = async function () {
  if (this.data.songUrl == '') {
    this.errors.push('Song URL is empty.');
  }
  if (this.data.songTitle == '') {
    this.errors.push('Song title is empty.');
  }
  // GET SONG OWNER'S ID. BETTER TO STORE THE ID THAN THE USERNAME FOR SEARCH LATER
  const userDoc = await User.findByUsername(this.data.songOwnerUsername);

  this.data = {
    songOwnerId: userDoc._id,
    songTitle: this.data.songTitle,
    songPostedDate: this.data.datePosted,
    songUrl: this.data.songUrl,
  };
};

Admin.prototype.uploadSong = function () {
  return new Promise(async (resolve, reject) => {
    try {
      this.validate();
      await this.cleanUp();

      if (!this.errors.length) {
        // SAVE INTO DB
        const song = await songsCollection.insertOne(this.data);

        resolve({ status: 'Success', songDetails: song.ops[0] });
      } else {
        reject(this.errors);
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = Admin;
