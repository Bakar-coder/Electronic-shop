const config = require('config');

if (process.env.NODE_ENV === 'production')
  module.exports = {
    mongoURI: {
      mongoURI: config.get('database')
    }
  };
module.exports = { mongoURI: 'mongodb://localhost:27017/node-shop' };
