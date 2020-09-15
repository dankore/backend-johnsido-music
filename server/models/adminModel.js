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

Admin.adminSearch = (searchText) => {
  return new Promise(async(resolve, reject) => {
    if(typeof searchText == 'string'){

      const searchResults = await usersCollection.find({$text: {$search: searchText }}).toArray();

      console.log(searchResults);

      resolve()
    } else {
      reject(['Must be a string.'])
    }
  })
}

module.exports = Admin;
