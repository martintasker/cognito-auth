'use strict';

'HANDLE WITH CARE: if you use this after you\'ve set up and got users, then you\'ll delete them and their data!!';

var teardownBuckets = require('./lib/teardown-buckets');
var teardownPools = require('./lib/teardown-pools');

var parser = new(require('argparse').ArgumentParser)();
parser.addArgument(['-p', '--pools'], {
  nargs: 0,
  help: 'tear down user pools',
});
parser.addArgument(['-b', '--bucket'], {
  nargs: 0,
  help: 'tear down bucket',
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
    if (args.bucket) {
      return teardownBuckets();
    } else {
      return Promise.resolve();
    }
  })
  .then(function() {
    if (args.pools) {
      return teardownPools();
    } else {
      return Promise.resolve();
    }
  })
  // catch-all error handler
  .catch(function(reason) {
    console.log("problem: %j", typeof reason === 'object' ? reason.toString() : reason);
  });
