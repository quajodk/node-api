/**
 * Handlers For API Routes
 */

//  Dependencies
const _data = require('./data');

// handle object
const handlers = {};

// accepted methods
handlers.acceptedMethods = ['get', 'post', 'delete', 'put'];

// notFound handler
handlers.notFound = (data, callback) => {
  callback(404, {name: 'page not found'});
};

// log all activities in a log file
handlers.helpers = {};

handlers.helpers.logger = async (data, method, status) => {
  // time of log
  const logTime = Date.now();

  // status check
  const logStatus =
    typeof status == 'number' && status == 200
      ? 'operation was successful'
      : 'operation failed';

  data = typeof data == 'object' && data !== 'undefined' ? data : {};

  const logData = {
    data,
    requestMethod: method,
    status: logStatus,
    time: logTime
  };

  const log = JSON.stringify(logData);

  try {
    const logAppended = await _data.append('data/logs', 'logger', log);
    return logAppended;
  } catch (error) {
    console.log(error);
  }
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
handlers._index.post = async (data, callback) => {
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

    try {
      const eitCreated = await _data.create('data', fileName, eit);

      if (!eitCreated) {
        const eitData = await _data.read('data', fileName);
        await handlers.helpers.logger(eitData, data.method, 200);
        callback(200, eitData);
      }
    } catch (error) {
      await handlers.helpers.logger({}, data.method, 500);
      callback(500, {Error: 'Could not create EIT'});
    }
  } else {
    callback(400, {Error: 'MIssing required data'});
  }
};

// eit - get
handlers._index.get = async (data, callback) => {
  let {email} = data.queryStringObject;

  email =
    typeof email === 'string' && email.trim().length > 0 ? email.trim() : false;

  if (email) {
    try {
      const eitData = await _data.read('data', email);
      await handlers.helpers.logger(eitData, data.method, 200);
      callback(200, eitData);
    } catch (error) {
      await handlers.helpers.logger({}, data.method, 404);
      callback(404, {Error: 'Could not found EIT'});
    }
  } else {
    try {
      const data = await _data.list('data');
      const returnData = data.map(async eit => {
        try {
          const eitData = await _data.read('data', eit);
          return eitData;
        } catch (error) {
          return error;
        }
      });
      await handlers.helpers.logger({}, data.method, 200);
      Promise.all(returnData).then(eitData => {
        callback(200, eitData);
      });
    } catch (error) {
      await handlers.helpers.logger({}, data.method, 500);
      return error;
    }
  }
};

// eit - put
handlers._index.put = async (data, callback) => {
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
    try {
      const eit = await _data.read('data', email);
      if (eit) {
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

          // update file
          const updatedFile = await _data.update('data', email, eit);

          if (!updatedFile) {
            // return updated eit
            const updatedEIt = await _data.read('data', email);
            await handlers.helpers.logger(updatedEIt, data.method, 200);
            callback(200, updatedEIt);
          }
        }
      } else {
        await handlers.helpers.logger({}, data.method, 404);
        callback(404, {Error: 'Could not find requested EIT'});
      }
    } catch (error) {
      await handlers.helpers.logger({}, data.method, 500);
      callback(500, {Error: 'Could find the requested eit'});
    }
  } else {
    await handlers.helpers.logger('', data.method, 400);
    callback(400, {Error: 'MIssing required data'});
  }
};

// eit - delete
handlers._index.delete = async (data, callback) => {
  let {email} = data.queryStringObject;

  email =
    typeof email === 'string' && email.trim().length > 0 ? email.trim() : false;

  if (email) {
    try {
      const deletedFile = await _data.delete('data', email);
      if (!deletedFile) {
        await handlers.helpers.logger(
          {message: 'EIT deleted successfully'},
          data.method,
          200
        );
        callback(200, {message: 'EIT deleted successfully'});
      }
    } catch (error) {
      await handlers.helpers.logger({}, data.method, 500);
      callback(500, {Error: 'Could not delete eit'});
    }
  } else {
    await handlers.helpers.logger('', data.method, 400);
    callback(400, {Error: 'MIssing required data'});
  }
};

// export handler
module.exports = handlers;
