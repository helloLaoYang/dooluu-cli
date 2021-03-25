
const { command: initAction } = require('./init')
const { command: installAction } = require('./install')
const { command: createAction } = require('./create')

module.exports = {
  initAction,
  installAction,
  createAction,
}
