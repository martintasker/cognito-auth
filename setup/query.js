'use strict';

var AWS = require('aws-sdk');

var config = require('./lib/config');
var settings = require('./lib/settings');

AWS.config.region = config.REGION;

var bucket = new AWS.S3({
  params: {
    Bucket: config.BUCKET_NAME,
    region: config.REGION,
  }
});

var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
var cognitoIdentity = new AWS.CognitoIdentity();

Promise.resolve()
  .then(function() {
    return queryIdentityPoolRoles(settings.get('identityPoolId'));
  })
  .catch(function(reason) {
    console.log("problem: %j", reason);
  });

function queryIdentityPoolRoles(identityPoolId) {
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
