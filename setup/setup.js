'use strict';

var setupPools = require('./lib/setup-pools');
var setupBuckets = require('./lib/setup-buckets');

var parser = new(require('argparse').ArgumentParser)();
parser.addArgument(['-p', '--pools'], {
  nargs: 0,
  help: 'construct user pools',
});
parser.addArgument(['-b', '--bucket'], {
  help: 'construct named bucket and set up permissions',
});
parser.addArgument(['-d', '--dry-run'], {
  nargs: 0,
  help: 'do not execute: just show args',
});
var args = parser.parseArgs();
if (args.dry_run) {
  console.log("args: %j", args);
  process.exit(1);
}

Promise.resolve()
  .then(function() {
    if (args.pools) {
      return setupPools();
    } else {
      return Promise.resolve();
    }
  })
  .then(function() {
    if (args.bucket) {
      return setupBuckets(args.bucket);
    } else {
      return Promise.resolve();
    }
  })
  // error catch-all
  .catch(function(reason) {
    console.log("problem: %j", typeof reason === 'object' ? reason.toString() : reason);
  });
