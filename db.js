require('dotenv').config();
const mongodb = require('mongodb');

mongodb.connect(
  process.env.CONNECTIONSTRING,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, client) {
    module.exports = client;
    const PORT = process.env.PORT || 3000;
    const server = require('./server/server');
    server.listen(PORT, () => {
      console.log(`Listening on port number: ${PORT}`);
    });
  }
);
