const express = require('express');
const server = express();
const apiRouter = require('./apiRouter');
const helmet = require('helmet');
const cors = require('cors');

// USE
server.use(helmet());
server.use(apiRouter);
server.use(cors());

module.exports = server;
