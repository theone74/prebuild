var fs = require('fs')
var async = require('async')
var getAbi = require('node-abi').getAbi
var getTarget = require('node-abi').getTarget
var getTarPath = require('./util').getTarPath
var build = require('./build')
var strip = require('./strip')
var pack = require('./pack')
var semver = require('semver')

function prebuild (opts, target, runtime, callback) {
  var pkg = opts.pkg
  var buildLog = opts.buildLog || function () {}
  opts.target = target
  opts.runtime = runtime

  if (opts.runtime === 'node-webkit') {
    opts.backend = 'nw-gyp'
  }

  var buildLogMessage = 'Preparing to prebuild ' + pkg.name + '@' + pkg.version + ' for ' + runtime + ' ' + target + ' on ' + opts.platform + '-' + opts.arch + ' using ' + opts.backend
  if (opts.libc && opts.libc.length > 0) buildLogMessage += 'using libc ' + opts.libc
  buildLog(buildLogMessage)

  // --target can be target or abi
  target = getTarget(target, runtime)
  var abi = getAbi(target, runtime)
  
  if (runtime == 'electron' && (process.env.FIX_ELECTRON || 0)) {
    var sem_ver = semver.parse(target)
    buildLog('node-pre-gyp fixer: abi', abi, ' -> ', sem_ver.major + '.' + sem_ver.minor)
    abi = sem_ver.major + '.' + sem_ver.minor
  }

  var tarPath = getTarPath(opts, abi)
  fs.stat(tarPath, function (err, st) {
    if (!err && !opts.force) {
      buildLog(tarPath + ' exists, skipping build')
      return callback(null, tarPath)
    }
    var tasks = [
      function (cb) {
        build(opts, target, function (err, filenames) {
          if (err) return cb(err)
          cb(null, filenames)
        })
      },
      function (filenames, cb) {
        buildLog('Packing ' + filenames.join(', ') + ' into ' + tarPath)
        pack(filenames, tarPath, function (err) {
          if (err) return cb(err)
          buildLog('Prebuild written to ' + tarPath)
          cb(null, tarPath)
        })
      }
    ]

    if (opts.strip) {
      tasks.splice(1, 0, function (filename, cb) {
        buildLog('Stripping debug information from ' + filename)
        strip(filename, function (err) {
          if (err) return cb(err)
          cb(null, filename)
        })
      })
    }

    async.waterfall(tasks, callback)
  })
}

module.exports = prebuild
