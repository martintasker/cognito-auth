'use strict';

'HANDLE WITH CARE: if you use this after you\'ve set up and got users, then you\'ll delete them and their data!!';

var teardownBuckets = require('./lib/teardown-buckets');
var teardownPools = require('./lib/teardown-pools');

Promise.resolve()
  .then(teardownBuckets)
  .then(teardownPools)
  // catch-all error handler
  .catch(function(reason) {
    console.log("problem: %j", typeof reason === 'object' ? reason.toString() : reason);
  });
