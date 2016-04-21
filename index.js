module.exports = process.env.NODE_ENV === 'production'
  ? require('./bin/prod/index.js')
  : require('./bin/dev/index.js')
