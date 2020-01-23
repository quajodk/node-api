// Dependencies
const data = require('../lib/data');
const assert = require('assert');

// test data
const eit = {
  firstName: 'test',
  lastName: 'user',
  email: 'test1@mail.com',
  age: '20',
  country: 'testNation'
};

// assert that data.create should return false
it('data.create should return false', async done => {
  const val = await data.create('test', eit.email, eit);
  assert.strictEqual(val, false);

  done();
});

// assert that data.read should return json object
it('data.read should return json object', async done => {
  const val = await data.read('test', eit.email);
  assert.strictEqual(typeof val, 'object');

  done();
});

// assert that data.update should return false
it('data.update should return false', async done => {
  const eitUpdate = {
    firstName: 'test',
    lastName: 'user',
    email: 'test@mail.com',
    age: '20',
    country: 'testNation'
  };
  await data.create('test', eit.email, eitUpdate);

  eitUpdate.firstName = 'New';
  eitUpdate.lastName = 'Test Data';
  const val = await data.update('test', eitUpdate.email, eitUpdate);
  assert.strictEqual(val, false);

  await data.delete('test', eitUpdate.email);
  done();
});

// assert that data.list should return array
it('data.list should return array', async done => {
  const val = await data.list('test');
  assert.strictEqual(Array.isArray(val), true);

  done();
});

// assert that data.delete should return array
it('data.delete should return array', async done => {
  const val = await data.delete('test', eit.email);
  assert.strictEqual(val, false);

  done();
});
