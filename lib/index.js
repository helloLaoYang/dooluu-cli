#!/usr/bin/env node
const envinfo = require('envinfo')
const sade = require('sade')

const pkg = require('../package')

const commands = require('./commands')

const prog = sade('dooluu')
  .version(pkg.version)

prog
	.command('init [dest]')
  .describe('Init dooluu project content.')
  .action(commands.initAction)

prog
	.command('install')
  .describe('Install description.')
  .action(commands.installAction)

prog
	.command('create [name]')
  .describe('Generate application with templates.')
	.action(commands.createAction)

prog
	.command('clone [projectNam]')
  .describe('Generate application with templates.')

prog
	.command('info')
	.describe('dooluu-cli info.')
	.action(() => {
		process.stdout.write('\nEnvironment Info:');
		envinfo
			.run({
				System: ['OS', 'CPU'],
				Binaries: ['Node', 'Yarn', 'npm'],
				Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
			})
			.then(info => process.stdout.write(`${info}\n`))
	});

prog.parse(process.argv)
  
    