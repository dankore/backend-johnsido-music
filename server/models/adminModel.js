const usersCollection = require('../../db').db().collection('users');

const Admin = class admin {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }
};

Admin.countUsers = () => {
  return new Promise(async resolve => {
    const totalUsers = await usersCollection.countDocuments();

    resolve(totalUsers);
  });
};

module.exports = Admin;
