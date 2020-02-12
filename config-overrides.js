const path = require('path')
const { override, fixBabelImports, addWebpackAlias } = require('customize-cra')

const joinRootPath = p => path.join(process.cwd(), p)

process.env.GENERATE_SOURCEMAP = 'false'

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: 'css'
  }),
  addWebpackAlias({ '@': joinRootPath('src') })
)
