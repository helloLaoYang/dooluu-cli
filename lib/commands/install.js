
const { resolve } = require('path')
const spawn = require('cross-spawn-promise')
const which = require('which')

const isCmd = function (cmd) {
  return !!which.sync(cmd, { nothrow: true })
}

// check yarn&lerna
const instsllGlobalDescription = function () {
  const prePkg = (
    ['lerna', 'yarn'].map((_) => !isCmd(_)
      ? _
      : undefined).filter(_ => _)
  )

  if (prePkg && prePkg.length) {
    return spawn(
      'npm',
      [
        'install',
        '-g',
        ...prePkg,
      ],
      {
        stdio: 'inherit',
      }
    ).catch(e => {
      process.exit()
    })
  }
  
}

// run yarn install
const installDescription = async function (cwd) {
  await instsllGlobalDescription()
  return spawn('yarn', ['install'], {
    cwd,
    stdio: 'inherit',
  }).catch(e => {
    process.exit()
  })
}

// run lerna bootstrap
const lernaDescription = async function (cwd) {
  await instsllGlobalDescription()
  return spawn('lerna', ['bootstrap'], {
    cwd,
    stdio: 'inherit',
  }).catch(e => {
    process.exit()
  })
}

const install = async function (target) {
  await instsllGlobalDescription()
  await installDescription(target)
  await lernaDescription(target)
}

exports.install = install

// installDescription
exports.command = async function () {
  const cwd = resolve(process.cwd())
  install()
}