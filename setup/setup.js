'use strict';

var setupPools = require('./lib/setup-pools');
var setupBuckets = require('./lib/setup-buckets');

Promise.resolve()
  .then(setupPools)
  .then(setupBuckets)
  // error catch-all
  .catch(function(reason) {
    console.log("problem: %j", typeof reason === 'object' ? reason.toString() : reason);
  });
