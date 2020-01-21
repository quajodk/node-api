// Dependencies
const data = require('../lib/data');
const assert = require('assert');
const util = require('util');

// test data
const eit = {
  firstName: 'test',
  lastName: 'user',
  email: 'test1@mail.com',
  age: '20',
  country: 'testNation'
};

// assert that data.create callback false
it('data.create should callback false', done => {
  const callback = err => {
    return false;
  };
  const testValue = data.create('test', eit.email, eit, callback);
  console.log(testValue);
  assert.strictEqual(
    testValue,
    'Could not create a new file, it may already exist'
  );
  done();
});
