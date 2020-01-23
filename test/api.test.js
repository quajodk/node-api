/**
 * API Testing
 */

process.env.PORT = 4000;

//  Dependencies
const http = require('http');
const app = require('../index');
const _data = require('../lib/data');
const assert = require('assert');

const api = {};

api.makeRequest = (method, path, payload, callback) => {
  const option = {
    protocol: 'http:',
    hostname: 'localhost',
    path,
    method,
    port: process.env.PORT || 4000,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = http.request(option, res => {
    let body = '';
    res.on('data', chuck => (body += chuck));
    res.on('end', () => callback(res.statusCode, JSON.parse(body)));
  });

  req.on('error', error => console.log(error));

  req.write(payload);
  req.end();
};

// making a post request to / should create eit and return 200 res code and the created eit data
describe('POST / should create eit and return 200 created eit data', async done => {
  // eit data
  const eit = {
    email: 'test@meltwater.com',
    firstName: 'test',
    lastName: 'API',
    age: '25',
    country: 'testNation'
  };

  const payload = JSON.stringify(eit);

  api.makeRequest('POST', '/', payload, (statusCode, data) => {
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(typeof data, 'object');
  });

  await _data.delete('data', eit.email);

  done();
});

// export
module.exports = api;
