const express = require('express');
const server = express();
const apiRouter = require('./apiRouter');
const helmet = require('helmet');
const port = process.env.PORT || 3000;

// USE
server.use(helmet());
server.use(apiRouter);

server.listen(() => {
  console.log('Listening on port ' + port);
});
