var test = require('tape')
var exec = require('child_process').exec
var path = require('path')
var fs = require('fs')
var rm = require('rimraf')

var cwd = path.join(__dirname, 'native-module')

test('can prebuild a native module for electron', function (t) {
  rm.sync(path.join(cwd, 'prebuilds'))
  var file = 'native-v1.0.0-electron-v50-' + process.platform + '-' + process.arch + '.tar.gz'
  var prebuild = path.join(cwd, 'prebuilds', file)
  // A quick, temporary fix for a node.js bug (https://github.com/prebuild/prebuild/pull/208#issuecomment-361108755)
  console.log()
  exec('npm run prebuild', { cwd: cwd }, function (error, stdout, stderr) {
    t.equal(error, null)
    t.equal(fs.existsSync(prebuild), true)
    t.end()
  })
})

test('can prebuild a native module for node-webkit', function (t) {
  rm.sync(path.join(cwd, 'prebuilds'))
  var file = 'native-v1.0.0-node-webkit-v59-' + process.platform + '-' + process.arch + '.tar.gz'
  var prebuild = path.join(cwd, 'prebuilds', file)
  // A quick, temporary fix for a node.js bug (https://github.com/prebuild/prebuild/pull/208#issuecomment-361108755)
  console.log()
  exec('npm run prebuild-node-webkit', { cwd: cwd }, function (error, stdout, stderr) {
    t.equal(error, null)
    t.equal(fs.existsSync(prebuild), true)
    t.end()
  })
})
