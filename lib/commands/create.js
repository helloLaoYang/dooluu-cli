require('colors')
const fs = require('fs')
const ora = require('ora')
const prompts = require('prompts')
const gittar = require('gittar')
const rimraf = require('rimraf')
const { resolve } = require('path')
const { promisify } = require('util')
const { install } = require('./install')
const { CREATE_TEMPLATE_LIST, INIT_TEMPLATE_PFX } = require('../constants')

const templates =  Object.keys(CREATE_TEMPLATE_LIST)
const isMedia = str => /\.(woff2?|ttf|eot|jpe?g|ico|png|gif|webp|mp4|mov|ogg|webm)(\?.*)?$/i.test(str)


const command = async function (name, argv) {
  if (!name) {
    process.stdout.write(
      '\n\n'
      + 'Please enter the project name.'.red
      + '\n\n'
    )
  }

  const cwd = resolve(process.cwd())
  const target = resolve(cwd, name)

  let template;
  let repo;

  if (!template) {

    const onCancel = () => {
			process.stdout.write('Aborting execution'.red)
			process.exit()
		}

    const response = await prompts([{
      type: 'select',
			name: 'template',
			message: 'Pick a template',
			choices: templates,
			initial: 0,
    }], { onCancel })

    template = templates[
      response['template']
    ]

    repo = CREATE_TEMPLATE_LIST[template]

    process.stdout.write('\n')
  }

  const spinner = ora(
    'Download template and generate application.\n\n'
  ).start()

  await promisify(rimraf)(target)

  const archive = await gittar.fetch(
    `${ INIT_TEMPLATE_PFX }/${ repo }`, {
      useCache: true,
    }
  ).catch(err => {
    process.stdout.write('\n' + 'download error...'.red + '\n\n')
    process.exit()
  })

  let keeps = []

  const options = {
    strip: 1,
		filter(path, obj) {
      obj.on('end', () => {
        if (obj.type === 'File' && !isMedia(obj.path)) {
          keeps.push(obj.absolute)
        }
      })
      return true
		},
  }

  await gittar.extract(archive, target, options).catch(err => {
    process.stdout.write('\n' + 'download error...'.red + '\n\n')
    process.exit()
  })

  if (keeps.length) {
		const dict = new Map();
		const templateVar = str => new RegExp(`{{\\s?${str}\\s}}`, 'g');

    ['name'].forEach(str => {
      dict.set(templateVar(str), name)
		})

		// Update each file's contents
		let buf
		let	entry
		for (entry of keeps) {
			buf = fs.readFileSync(entry, 'utf8')
			dict.forEach((v, k) => {
				buf = buf.replace(k, v);
			});
			fs.writeFileSync(entry, buf, 'utf8')
		}
  }

  spinner.text = 'Install description...\n\n'
  spinner.stop()

  await install(target)

  process.stdout.write(
    '\n\n'
    + 'Generate application success'.green
    + '\n\nℹℹℹ '.green
    + 'Next: \n\n'
    + 'you can use:'
    + '\n\n'
    + '\'dooluu serve\''.green
    + ' to run your application.'
    + '\n'
    + '\'dooluu build\''.green
    + ' to build your application for production env.'
    + '\n'
    + '\'dooluu build:test\''.green
    + ' to build your application for test env.'
    + '\n\n'
    + 'thx!!!'
  )

  spinner.stop()
  
}


exports.command = command
