/**
/ API Server
 */

//  Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const handlers = require('./lib/handlers');

// server object
const server = {};

// create server
server.httpServer = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const pathName = path.replace(/^\/+|\/+$/g, '');

  const method = req.method.toLowerCase();
  const headers = req.headers;
  const queryStringObject = parsedUrl.query;

  // if any payload
  const decoder = new StringDecoder('utf-8');
  let payload = '';
  req.on('data', data => {
    payload += decoder.write(data);
  });

  req.on('end', () => {
    payload += decoder.end();

    // select the route from the request
    const selectHandler =
      typeof server.router[pathName] !== 'undefined'
        ? server.router[pathName]
        : handlers.notFound;

    // data object
    const data = {
      method,
      headers,
      queryStringObject,
      payload: server.parseJsonToObject(payload),
      pathName
    };

    try {
      // select handler
      selectHandler(data, (statusCode, payload) => {
        server.processResponse(res, statusCode, payload);
      });
    } catch (error) {
      console.log(error);
      server.processResponse(res, 500, {Error: 'an error has occurred'});
    }
  });
});

server.processResponse = (res, statusCode, payload) => {
  statusCode = typeof statusCode == 'number' ? statusCode : 200;
  payload = typeof payload == 'object' ? payload : {};

  const payloadString = JSON.stringify(payload);

  // return a response
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(statusCode);
  res.end(payloadString);
};

// router
server.router = {
  '': handlers.index
};

// create helper functions
server.parseJsonToObject = str => {
  try {
    const parsedString = JSON.parse(str);
    return parsedString;
  } catch (error) {
    return {};
  }
};

// server port
const PORT = process.env.PORT || 3000;
// server listen
server.httpServer.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
