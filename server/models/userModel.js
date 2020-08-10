/* eslint-disable no-async-promise-executor */
const usersCollection = require('../../db').db().collection('users');
const validator = require('validator');
const bcrypt = require('bcryptjs');
let User = class user {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }
};

User.prototype.cleanUp = function () {
  if (typeof this.data.username != 'string') {
    this.data.username = '';
  }
  if (typeof this.data.email != 'string') {
    this.data.email = '';
  }
  if (typeof this.data.firstName != 'string') {
    this.data.firstName = '';
  }
  if (typeof this.data.lastName != 'string') {
    this.data.lastName = '';
  }
  if (typeof this.data.password != 'string') {
    this.data.password = '';
  }
  if (typeof this.data.confirmPassword != 'string') {
    this.data.confirmPassword = '';
  }
  // GET RID OF BOGUS PROPERTIES
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    firstName: this.data.firstName.trim(),
    lastName: this.data.lastName.trim(),
    email: this.data.email.trim().toLowerCase(),
    userCreationDate: this.data.userCreationDate,
    verified: false,
    password: this.data.password,
    confirmPassword: this.data.confirmPassword,
  };
};

User.prototype.validate = function () {
  return new Promise(async resolve => {
    if (this.data.username == '') {
      this.errors.push('You must provide a username.');
    }
    if (this.data.username != '' && !validator.isAlphanumeric(this.data.username)) {
      this.errors.push('Username can only contain letters and numbers.');
    }
    if (this.data.firstName == '') {
      this.errors.push('You must provide a first name.');
    }
    if (this.data.lastName == '') {
      this.errors.push('You must provide a last name.');
    }
    if (!validator.isEmail(this.data.email)) {
      this.errors.push('You must provide a valid email address.');
    }
    if (this.data.password == '') {
      this.errors.push('You must provide a password.');
    }
    if (this.data.password.length > 0 && this.data.password.length < 6) {
      this.errors.push('Password must be at least 6 characters.');
    }
    if (this.data.confirmPassword == '') {
      this.errors.push('Confirm password field is empty.');
    }
    if (this.data.confirmPassword.length != this.data.password.length) {
      this.errors.push('Passwords do not match.');
    }
    if (this.data.password.length > 50) {
      this.errors.push('Password cannot exceed 50 characters.');
    }
    if (this.data.username.length > 0 && this.data.username.length < 3) {
      this.errors.push('Username must be at least 3 characters.');
    }
    if (this.data.username.length > 30) {
      this.errors.push('Username cannot exceed 30 characters.');
    }

    // Only if username is valid then check to see if it's already taken
    if (
      this.data.username.length > 2 &&
      this.data.username.length < 31 &&
      validator.isAlphanumeric(this.data.username)
    ) {
      const userDoc = await usersCollection.findOne({
        username: this.data.username,
      });

      if (userDoc) {
        this.errors.push('That username is already taken.');
        resolve(); // NO NEED TO GO FURTHER
      }
    }

    // Only if email is valid then check to see if it's already taken
    if (validator.isEmail(this.data.email)) {
      const userDoc = await usersCollection.findOne({
        email: this.data.email,
      });

      if (userDoc) {
        this.errors.push('That email is already being used.');
      }
    }
    resolve();
  });
};

User.prototype.register = function () {
  return new Promise(async (resolve, reject) => {
    // CLEAN / VALIDATE USER DATA
    this.cleanUp();
    await this.validate();

    if (!this.errors.length) {
      // HASH PASSWORD
      let salt = bcrypt.genSaltSync();
      this.data.password = bcrypt.hashSync(this.data.password, salt);

      // SAVE IN DB
      await usersCollection.insertOne(this.data);
      // this.getAvatar();
      resolve('Success');
    } else {
      reject(this.errors);
    }
  });
};

User.findByEmail = email => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await usersCollection.findOne({ email });

      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

User.findByUsername = username => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await usersCollection.findOne({ username });

      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

// EXPORT CODE
module.exports = User;
