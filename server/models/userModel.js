const usersCollection = require('../../db').db().collection('users');

let User = class user {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }
};

User.prototype.register = function () {
  return new Promise((resolve, reject) => {
    usersCollection
      .insertOne(this.data)
      .then(result => {
        resolve(result.ops[0]);
      })
      .catch(error => {
        reject(error);
      });
  });
};

module.exports = User;
