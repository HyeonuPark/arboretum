module.exports = process.env.NODE_ENV === 'development'
  ? require('./bin/dev/index.js')
  : require('./bin/prod/index.js')
