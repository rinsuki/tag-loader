const riot = require('riot')
const loaderUtils = require('loader-utils')

const TAGS_NAMES_REGEX = /riot.tag2\(['|"](.+?)['|"],/g

/**
 * Generate the hmr code depending on the tags generated by the compiler
 * @param   { Array } tags - array of strings
 * @returns { String } the code needed to handle the riot hot reload
 */
function hotReload(tags) {
  return `
  if (module.hot) {
    module.hot.accept()
    if (module.hot.data) {
      ${ tags.map(tag => `riot.reload('${ tag }')`).join('\n') }
    }
  }`
}


module.exports = function(source) {
  const query = loaderUtils.parseQuery(this.query)
  const code = riot.compile(source, query, this.resourcePath)
  const tags = []
  var hotReloadCode = ''

  code.replace(TAGS_NAMES_REGEX, function(_, match) {
    tags.push(match)
  })

  if (this.cacheable) this.cacheable()
  if (query.hot) hotReloadCode = hotReload(tags)

  return `
    var riot = require('riot')
    ${ code }
    ${ hotReloadCode }
  `
}