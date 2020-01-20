/**
 * Handlers For API Routes
 */

//  Dependencies
const _data = require('./data');
const util = require('util');

// handle object
const handlers = {};

// accepted methods
handlers.acceptedMethods = ['get', 'post', 'delete', 'put'];

// notFound handler
handlers.notFound = (data, callback) => {
  callback(404, {name: 'page not found'});
};

// routing base on method
handlers.index = (data, callback) => {
  const {method} = data;

  if (handlers.acceptedMethods.indexOf(method) > -1) {
    handlers._index[method](data, callback);
  }
};

// eit object
handlers._index = {};

// eit - post
handlers._index.post = (data, callback) => {
  let {firstName, lastName, email, country, age} = data.payload;

  firstName =
    typeof firstName === 'string' && firstName.trim().length > 0
      ? firstName.trim()
      : false;
  lastName =
    typeof lastName === 'string' && lastName.trim().length > 0
      ? lastName.trim()
      : false;
  email =
    typeof email === 'string' && email.trim().length > 0 ? email.trim() : false;
  age = typeof age === 'string' && age.trim().length > 0 ? age.trim() : false;
  country =
    typeof country === 'string' && country.trim().length > 0
      ? country.trim()
      : false;

  if (firstName && lastName && email && country && age) {
    const fileName = email.trim();

    // create eit
    const eit = {
      firstName,
      lastName,
      email,
      age,
      country
    };

    util
      .promisify(_data.create)('data', fileName, eit)
      .then(() => {
        // get the created eit
        util
          .promisify(_data.read)('data', fileName)
          .then(eit => {
            callback(201, eit);
          })
          .catch(err => {
            callback(500, {Error: 'Reading created eit'});
          });
      })
      .catch(err => {
        console.log(err);
        callback(500, {Error: 'Could not create eit'});
      });
  }
};

// eit - get
handlers._index.get = (data, callback) => {
  let {email} = data.queryStringObject;

  email =
    typeof email === 'string' && email.trim().length > 0 ? email.trim() : false;

  if (email) {
    util
      .promisify(_data.read)('data', email)
      .then(eit => {
        callback(200, eit);
      })
      .catch(err => {
        console.log(err);
        callback(404, {Error: 'Could not find requested eit'});
      });
  } else {
    util
      .promisify(_data.list)('data')
      .then(eits => {
        const eitArray = eits.map(eit => {
          return util.promisify(_data.read)('data', eit);
        });

        Promise.all(eitArray).then(eitData => {
          callback(200, eitData);
        });
      })
      .catch(err => {
        console.log(err);
        callback(404, {Error: 'No eit was found'});
      });
  }
};

// eit - put
handlers._index.put = (data, callback) => {
  let {firstName, lastName, email, country, age} = data.payload;

  firstName =
    typeof firstName === 'string' && firstName.trim().length > 0
      ? firstName.trim()
      : false;
  lastName =
    typeof lastName === 'string' && lastName.trim().length > 0
      ? lastName.trim()
      : false;
  email =
    typeof email === 'string' && email.trim().length > 0 ? email.trim() : false;
  age = typeof age === 'string' && age.trim().length > 0 ? age.trim() : false;
  country =
    typeof country === 'string' && country.trim().length > 0
      ? country.trim()
      : false;

  if (email) {
    // get eit
    util
      .promisify(_data.read)('data', email)
      .then(eit => {
        if (firstName || lastName || age || country) {
          if (firstName) {
            eit.firstName = firstName;
          }
          if (lastName) {
            eit.lastName = lastName;
          }
          if (country) {
            eit.country = country;
          }
          if (age) {
            eit.age = age;
          }

          // update eit file
          util
            .promisify(_data.update)('data', email, eit)
            .then(() => {
              // read the new eit data
              util
                .promisify(_data.read)('data', email)
                .then(updatedEIt => {
                  callback(200, updatedEIt);
                })
                .catch(err => {
                  console.log(err);
                  callback(500, {Error: 'Could not read updated eit data'});
                });
            })
            .catch(400, {Error: 'Could not update eit'});
        }
      })
      .catch(err => {
        console.log(err);
        callback(500, {Error: 'Could find the requested eit'});
      });
  }
};

// eit - delete
handlers._index.delete = (data, callback) => {
  let {email} = data.queryStringObject;

  email =
    typeof email === 'string' && email.trim().length > 0 ? email.trim() : false;

  if (email) {
    util
      .promisify(_data.delete)('data', email)
      .then(() => {
        callback(200, {message: 'EIT deleted successfully'});
      })
      .catch(err => {
        console.log(err);
        callback(500, {Error: 'Could not delete eit'});
      });
  }
};

// export handler

module.exports = handlers;
