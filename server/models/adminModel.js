const { ObjectID } = require('mongodb');

const usersCollection = require('../../db').db().collection('users');

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

Admin.downgradeAdminToUser = userId => {
  return new Promise(async (resolve, reject) => {
    try {
      await usersCollection.findOneAndUpdate(
        { _id: new ObjectID(userId) },
        {
          $pull: {
            scope: 'admin',
          },
        }
      );

      resolve('Success');
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = Admin;
