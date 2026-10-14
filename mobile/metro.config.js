// La app comparte los datos y la lógica de la web (../src): partidas, guía, jefes, builds, mapa…
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
const repoRoot = path.resolve(projectRoot, '..')
const escape = (s) => s.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')

const config = getDefaultConfig(projectRoot)
config.watchFolders = [path.join(repoRoot, 'src')]
// Lo importado desde ../src se resuelve con los node_modules de la app (mismo React que React Native):
// se ignoran los node_modules de la web y se busca en los de la app.
config.resolver.nodeModulesPaths = [path.join(projectRoot, 'node_modules')]
const block = new RegExp(`^${escape(path.join(repoRoot, 'node_modules'))}\\/.*`)
const prev = config.resolver.blockList
config.resolver.blockList = prev ? [].concat(prev, block) : block
module.exports = config
