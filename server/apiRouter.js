const express = require('express');
const apiRouter = express.Router();

apiRouter.get('/', (req, res) => {
  res.send('hi');
});

module.exports = apiRouter;
