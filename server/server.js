const express = require('express');
const server = express();
const apiRouter = require('./apiRouter');
const helmet = require('helmet');
const cors = require('cors');
// const morgan = require('morgan');

// USE
server.use(helmet());
// server.use(morgan('combined'));
server.use(express.urlencoded({ extended: true }));
server.use(apiRouter);
server.use(cors());

module.exports = server;
