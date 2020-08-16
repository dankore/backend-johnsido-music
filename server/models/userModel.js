/* eslint-disable no-async-promise-executor */
const usersCollection = require('../../db').db().collection('users');
// const validator = require('validator');
const bcrypt = require('bcryptjs');
const { ObjectID } = require('mongodb');
let User = class user {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }
};

// User.prototype.cleanUp = function (type) {
//   if (typeof this.data.username != 'string') {
//     this.data.username = '';
//   }
//   if (typeof this.data.email != 'string') {
//     this.data.email = '';
//   }
//   if (typeof this.data.firstName != 'string') {
//     this.data.firstName = '';
//   }
//   if (typeof this.data.lastName != 'string') {
//     this.data.lastName = '';
//   }
//   if (typeof this.data?.password != 'string') {
//     this.data.password = '';
//   }
//   if (typeof this.data?.confirmPassword != 'string') {
//     this.data.confirmPassword = '';
//   }
//   // GET RID OF BOGUS PROPERTIES with
//   this.data = {
//     ...(type == 'updateInfo' && { _id: this.data._id }),
//     username: this.data.username.trim().toLowerCase(),
//     firstName: this.data.firstName.trim(),
//     lastName: this.data.lastName.trim(),
//     email: this.data.email.trim().toLowerCase(),
//     ...(type == 'register' && {
//       userCreationDate: this.data.userCreationDate,
//     }),
//     ...(type == 'register' && {
//       verified: false,
//     }),
//     about: {
//       bio: this.data.about?.bio ? this.data.about.bio : '',
//       city: this.data.about?.city ? this.data.about.city : '',
//       musicCategory: this.data.about?.musicCategory ? this.data.about.musicCategory : '',
//     },
//     ...(type == 'register' && {
//       avatar:
//         'https://res.cloudinary.com/my-nigerian-projects/image/upload/f_auto,q_auto/v1597076721/Others/john/default-avatar.jpg',
//     }),
//     ...(type == 'register' && {
//       password: this.data.password,
//     }),
//   };
// };

// User.prototype.validate = function (type) {
//   return new Promise(async resolve => {
//     if (this.data?.username == '') {
//       this.errors.push('You must provide a username.');
//     }
//     if (this.data?.username != '' && !validator.isAlphanumeric(this.data?.username)) {
//       this.errors.push('Username can only contain letters and numbers.');
//     }
//     if (this.data?.firstName == '') {
//       this.errors.push('You must provide a first name.');
//     }
//     if (this.data?.lastName == '') {
//       this.errors.push('You must provide a last name.');
//     }
//     if (this.data?.email) {
//       if (!validator.isEmail(this.data?.email)) {
//         this.errors.push('You must provide a valid email address.');
//       }
//     }
//     if (this.data?.password == '') {
//       this.errors.push('You must provide a password.');
//     }
//     if (this.data?.password?.length > 0 && this.data?.password?.length < 6) {
//       this.errors.push('Password must be at least 6 characters.');
//     }
//     if (this.data?.confirmPassword == '') {
//       this.errors.push('Confirm password field is empty.');
//     }
//     if (this.data?.confirmPassword) {
//       if (this.data?.confirmPassword?.length != this.data?.password?.length) {
//         this.errors.push('Passwords do not match.');
//       }
//     }
//     if (this.data?.password?.length > 50) {
//       this.errors.push('Password cannot exceed 50 characters.');
//     }
//     if (this.data?.username.length > 0 && this.data?.username.length < 3) {
//       this.errors.push('Username must be at least 3 characters.');
//     }
//     if (this.data?.username.length > 30) {
//       this.errors.push('Username cannot exceed 30 characters.');
//     }

//     // Only if username is valid then check to see if it's already taken
//     if (
//       this.data.username.length > 2 &&
//       this.data.username.length < 31 &&
//       validator.isAlphanumeric(this.data.username)
//     ) {
//       const userDoc = await usersCollection.findOne({
//         username: this.data.username,
//       });

//       if (userDoc && type == 'register') {
//         this.errors.push('That username is already taken.');
//         resolve(); // NO NEED TO GO FURTHER
//       }
//     }

//     // Only if email is valid then check to see if it's already taken
//     if (type == 'register') {
//       if (validator.isEmail(this.data.email)) {
//         const userDoc = await usersCollection.findOne({
//           email: this.data.email,
//         });

//         if (userDoc) {
//           this.errors.push('That email is already being used.');
//         }
//       }
//     }
//     resolve();
//   });
// };

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

// User.prototype.cleanUp_validate_login = function () {
//   if (typeof this.data.username != 'string') {
//     this.data.username = '';
//   }
//   if (typeof this.data.password != 'string') {
//     this.data.password = '';
//   }
//   if (this.data.username == '') {
//     this.errors.push('Username is empty.');
//   }
//   if (this.data.password == '') {
//     this.errors.push('Password is empty.');
//   }

//   this.data = {
//     username: this.data.username,
//     password: this.data.password,
//   };
// };

User.prototype.login = function () {
  return new Promise((resolve, reject) => {
    // this.validate();

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
        };
      }

      resolve(response);
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
        };
      }

      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

User.prototype.saveUpdatedProfileInfo = function () {
  return new Promise(async (resolve, reject) => {
    // await this.validate('updateInfo');
    // this.cleanUp('updateInfo');

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

// EXPORT CODE
module.exports = User;
