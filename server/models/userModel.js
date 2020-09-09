/* eslint-disable no-async-promise-executor */
const usersCollection = require('../../db').db().collection('users');
const commentsCollection = require('../../db').db().collection('comments');
const followsCollection = require('../../db').db().collection('follows');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { ObjectID } = require('mongodb');
const sanitizeHTML = require('sanitize-html');

// CLASS
let User = class user {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }
};

User.prototype.cleanUp = function (type) {
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
  if (this.data.password && typeof this.data.password != 'string') {
    this.data.password = '';
  }
  if (this.data.confirmPassword && typeof this.data.confirmPassword != 'string') {
    this.data.confirmPassword = '';
  }
  // GET RID OF BOGUS PROPERTIES with
  switch (type) {
    case 'login':
      this.data = {
        username: sanitizeHTML(this.data.username.trim().toLowerCase(), {
          allowedTags: [],
          allowedAttributes: {},
        }),
        password: sanitizeHTML(this.data.password, { allowedTags: [], allowedAttributes: {} }),
      };
      break;
    case 'updateInfo':
      this.data = {
        _id: ObjectID(this.data._id),
        username: sanitizeHTML(this.data.username.trim().toLowerCase(), {
          allowedTags: [],
          allowedAttributes: {},
        }),
        firstName: sanitizeHTML(this.data.firstName.trim(), {
          allowedTags: [],
          allowedAttributes: {},
        }),
        lastName: sanitizeHTML(this.data.lastName.trim(), {
          allowedTags: [],
          allowedAttributes: {},
        }),

        email: this.data.email.trim().toLowerCase(),
        about: {
          bio: sanitizeHTML(this.data.about.bio, { allowedTags: [], allowedAttributes: {} }),
          city: sanitizeHTML(this.data.about.city, { allowedTags: [], allowedAttributes: {} }),
          musicCategory: sanitizeHTML(this.data.about.musicCategory, {
            allowedTags: [],
            allowedAttributes: {},
          }),
        },
      };
      break;
    case 'register':
      this.data = {
        username: sanitizeHTML(this.data.username.trim().toLowerCase(), {
          allowedTags: [],
          allowedAttributes: {},
        }),
        firstName: sanitizeHTML(this.data.firstName.trim(), {
          allowedTags: [],
          allowedAttributes: {},
        }),
        lastName: sanitizeHTML(this.data.lastName.trim(), {
          allowedTags: [],
          allowedAttributes: {},
        }),

        email: this.data.email.trim().toLowerCase(),
        userCreationDate: this.data.userCreationDate,
        verified: false,
        admin: false,
        avatar:
          'https://res.cloudinary.com/my-nigerian-projects/image/upload/f_auto,q_auto/v1597076721/Others/john/default-avatar.jpg',
        password: this.data.password,
        about: {
          bio: '',
          city: '',
          musicCategory: '',
        },
      };
      break;
    case 'changePassword':
      this.data = {
        _id: ObjectID(this.data._id),
        password: sanitizeHTML(this.data.password, { allowedTags: [], allowedAttributes: {} }),
      };
      break;
  }
};

User.prototype.validate = function (type) {
  return new Promise(async resolve => {
    if (this.data.username && this.data.username == '') {
      this.errors.push('You must provide a username.');
    }
    if (
      this.data.username &&
      this.data.username != '' &&
      !validator.isAlphanumeric(this.data.username)
    ) {
      this.errors.push('Username can only contain letters and numbers.');
    }
    if (this.data.firstName && this.data.firstName == '') {
      this.errors.push('You must provide a first name.');
    }
    if (this.data.lastName && this.data.lastName == '') {
      this.errors.push('You must provide a last name.');
    }
    if (this.data.email) {
      if (!validator.isEmail(this.data.email)) {
        this.errors.push('You must provide a valid email address.');
      }
    }
    if (this.data.password && this.data.password == '') {
      this.errors.push('You must provide a password.');
    }
    if (this.data.password && this.data.password.length > 0 && this.data.password.length < 6) {
      this.errors.push('Password must be at least 6 characters.');
    }
    if (this.data.confirmPassword && this.data.confirmPassword == '') {
      this.errors.push('Confirm password field is empty.');
    }
    if (this.data.confirmPassword) {
      if (this.data.confirmPassword.length != this.data.password.length) {
        this.errors.push('Passwords do not match.');
      }
    }
    if (this.data.password && this.data.password.length > 50) {
      this.errors.push('Password cannot exceed 50 characters.');
    }
    if (this.data.username && this.data.username.length > 0 && this.data.username.length < 3) {
      this.errors.push('Username must be at least 3 characters.');
    }
    if (this.data.username && this.data.username.length > 30) {
      this.errors.push('Username cannot exceed 30 characters.');
    }
    if (this.data.about) {
      if (this.data.about.musicCategory.length > 50) {
        this.errors.push('Music genre cannot exceed 50 characters.');
      }
      if (this.data.about.city.length > 70) {
        this.errors.push('City/town name cannot exceed 70 characters.');
      }
      if (this.data.about.bio.length > 400) {
        this.errors.push('Bio cannot exceed 400 characters.');
      }
    }

    // Only if username is valid then check to see if it's already taken
    if (
      this.data.username &&
      this.data.username.length > 2 &&
      this.data.username.length < 31 &&
      validator.isAlphanumeric(this.data.username)
    ) {
      const userDoc = await usersCollection.findOne({
        username: this.data.username,
      });

      if (userDoc && type == 'register') {
        this.errors.push('That username is already taken.');
        resolve(); // NO NEED TO GO FURTHER
      }
    }

    // Only if email is valid then check to see if it's already taken
    if (type == 'register') {
      if (this.data.email && validator.isEmail(this.data.email)) {
        const userDoc = await usersCollection.findOne({
          email: this.data.email,
        });

        if (userDoc) {
          this.errors.push('That email is already being used.');
        }
      }
    }

    // CHANGE PASSWORD: CHECK IF CURRENT PASSWORD IS THE SAME AS ENTERED PASSWORD
    if (type == 'changePassword') {
      const userDoc = await usersCollection.findOne({ _id: new ObjectID(this.data._id) });

      if (!(userDoc && bcrypt.compareSync(this.data.currentPassword, userDoc.password))) {
        this.errors.push('Current password is invalid.');
      }
    }
    resolve();
  });
};

User.prototype.register = function () {
  return new Promise(async (resolve, reject) => {
    // CLEAN / VALIDATE USER DATA
    await this.validate('register');
    this.cleanUp('register');

    if (!this.errors.length) {
      // HASH PASSWORD
      let salt = bcrypt.genSaltSync();
      this.data.password = bcrypt.hashSync(this.data.password, salt);

      // SAVE IN DB
      await usersCollection.insertOne(this.data);
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

User.prototype.login = function () {
  return new Promise(async (resolve, reject) => {
    await this.validate();
    this.cleanUp('login');

    if (!this.errors.length) {
      usersCollection
        .findOne({ username: this.data.username })
        .then(attemptedUser => {
          if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
            this.data = attemptedUser;
            resolve();
          } else {
            reject(['Invalid username / password']);
          }
        })
        .catch(() => {
          reject();
        });
    } else {
      reject(this.errors);
    }
  });
};

User.findByEmail = email => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await usersCollection.findOne({ email });

      if (response) {
        // CLEAN UP
        response = {
          _id: response._id,
          username: response.username,
          firstName: response.firstName,
          lastName: response.lastName,
          avatar: response.avatar,
          email: response.email,
          about: response.about,
          verified: response.verified,
          admin: response.admin,
        };

        resolve(response);
      } else {
        // USER DOES NOT EXISTS
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

User.findByUsername = username => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await usersCollection.findOne({ username });

      // CLEAN UP
      if (response) {
        response = {
          _id: response._id,
          username: response.username,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          avatar: response.avatar,
          about: response.about,
          verified: response.verified,
          admin: response.admin,
        };

        resolve(response);
      } else {
        // USER DOES NOT EXISTS
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

User.prototype.saveUpdatedProfileInfo = function () {
  return new Promise(async (resolve, reject) => {
    await this.validate('updateInfo');
    this.cleanUp('updateInfo');

    if (!this.errors.length) {
      usersCollection.findOneAndUpdate(
        { _id: new ObjectID(this.data._id) },
        {
          $set: {
            username: this.data.username,
            firstName: this.data.firstName,
            lastName: this.data.lastName,
            email: this.data.email,
            about: {
              bio: this.data.about.bio,
              city: this.data.about.city,
              musicCategory: this.data.about.musicCategory,
            },
          },
        }
      );
      // SUCCESS
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

User.prototype.changePassword = function () {
  return new Promise(async (resolve, reject) => {
    // VALIDATION
    await this.validate('changePassword');
    this.cleanUp('changePassword');

    if (!this.errors.length) {
      // HASH NEW PASSWORD
      const salt = bcrypt.genSaltSync();
      this.data.password = bcrypt.hashSync(this.data.password, salt);

      usersCollection
        .findOneAndUpdate(
          { _id: new ObjectID(this.data._id) },
          {
            $set: {
              password: this.data.password,
            },
          }
        )
        .then(() => {
          // SUCCESS
          resolve('Success');
        })
        .catch(error => {
          // NETWORK ERRORS
          reject(error);
        });
    } else {
      // VALIDATION ERRORS
      reject(this.errors);
    }
  });
};

User.deleteAccount = id => {
  return new Promise(async (resolve, reject) => {
    try {
      await usersCollection.findOneAndDelete({ _id: new ObjectID(id) });

      resolve();

      // DELETE COMMENTS
      await commentsCollection.deleteMany({ author: new ObjectID(id) });

      // DELETE FOLLOWS
      await followsCollection.deleteMany({
        $or: [{ followerId: new ObjectID(id) }, { followedId: new ObjectID(id) }],
      });
    } catch (error) {
      reject(error);
    }
  });
};

// EXPORT CODE
module.exports = User;
