module.exports = process.env.NODE_ENV === 'production'
  ? require('./bin/prod/index')
  : require('./bin/dev/index')
