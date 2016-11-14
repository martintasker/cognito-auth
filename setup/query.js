'use strict';

var AWS = require('aws-sdk');

var config = require('./lib/config');
var settings = require('./lib/settings');

AWS.config.region = config.REGION;

var cognitoIdentity = new AWS.CognitoIdentity();

Promise.resolve()
  .then(queryIdentityPoolRoles)
  .catch(function(reason) {
    console.log("problem: %j", reason);
  });

function queryIdentityPoolRoles() {
  var identityPoolId = settings.get('identityPoolId');
  return new Promise(function(resolve, reject) {
    cognitoIdentity.getIdentityPoolRoles({
      IdentityPoolId: identityPoolId,
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("queryIdentityPoolRoles -> %j", data);
      return resolve(data);
    });
  });
}
