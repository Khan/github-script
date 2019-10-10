const core = require('@actions/core')
const {GitHub, context} = require('@actions/github')

process.on('unhandledRejection', handleError)
main().catch(handleError)

const getScriptFunction = () => {
  const script_path = core.getInput('script-path')
  if (script_path) {
    return require(script_path)
  }
  const script = core.getInput('script', {required: true});
  return new AsyncFunction('github', 'context', 'core', script)
}

async function main() {
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
  const token = core.getInput('github-token', {required: true})
  const debug = core.getInput('debug')
  const userAgent = core.getInput('user-agent')
  const previews = core.getInput('previews')
  const opts = {}
  if (debug === 'true') opts.log = console
  if (userAgent != null) opts.userAgent = userAgent
  if (previews != null) opts.previews = previews.split(',')
  const client = new GitHub(token, opts)
  const fn = getScriptFunction();
  const result = await fn(client, context, core)
  core.setOutput('result', JSON.stringify(result))
}

function handleError(err) {
  console.error(err)
  core.setFailed(err.message)
}
