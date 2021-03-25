require('colors')
const { resolve } = require('path')
const prompt = require('prompts')
const ora = require('ora')
const rimraf = require('rimraf')
const gittar = require('gittar')
const { promisify } = require('util')
const { install: installAction } = require('./install')
const { INIT_TEMPLATE_LIST, INIT_TEMPLATE_PFX } = require('../constants')

const templates = Object.keys(INIT_TEMPLATE_LIST)

const downloadRepo = async function (repo, target, options) {
  const archive = await gittar.fetch(
    `${ INIT_TEMPLATE_PFX }/${ repo }`, {
      useCache: true,
    }
  ).catch(err => {
    process.stdout.write('\n' + 'download error...'.red + '\n\n')
    process.exit()
  })
  return gittar.extract(archive, target, options).catch(err => {
    process.stdout.write('\n' + 'download error...'.red + '\n\n')
    process.exit()
  })
}

/**
 * 创建项目
 */
exports.command = async function (dest) {
  const cwd = resolve(process.cwd())

  let template;

  if (!template) {
    const onCancel = () => {
			process.stdout.write('Aborting execution'.red)
			process.exit()
		}
		const response = await prompt([{
			type: 'select',
			name: 'template',
			message: 'Pick a template',
			choices: templates,
			initial: 0,
		},], { onCancel })


    template = templates[
      response['template']
    ]

    process.stdout.write('\n')
  }

  if (!dest) {
    dest = template
  }

  const target = resolve(cwd, dest)

  const spinner = ora(
    'Download template and generate application:'
    + ' '
    + template
    + '\n\n'
  ).start()

  await promisify(rimraf)(target)

  await downloadRepo(template, target)

  const packages = INIT_TEMPLATE_LIST[template]

  console.log('packages', packages)

  if (packages && packages.length) {
    spinner.text = 'Install common packages'

    await Promise.all(
      packages.map((repo) =>(
        downloadRepo(repo, resolve(target, 'packages', repo))
      ))
    )
  }
  
  spinner.text = 'Install description...\n\n'
  spinner.stop()

  await installAction(target)

  process.stdout.write(
    '\n\n'
    + 'Generate application success'.green
    + '\n\nℹℹℹ '.green
    + 'Next: \n\n'
    + 'you can use \'dooluu create\' to generate application.'
    + '\nor\n'
    + 'you can use \'dooluu clone\' download application.\n\n'
  )
}
