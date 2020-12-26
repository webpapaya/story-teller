function noop () {
  return {}
}
// eslint-disable-next-line node/no-deprecated-api
require.extensions['.css'] = noop
