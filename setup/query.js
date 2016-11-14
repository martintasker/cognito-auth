'use strict';

var AWS = require('aws-sdk');

var config = require('./lib/config');
var settings = require('./lib/settings');

AWS.config.region = config.REGION;

var cognitoIdentity = new AWS.CognitoIdentity();
var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

Promise.resolve()
.then(queryIdentityPoolRoles)
.then(queryUsers)
  .catch(function(reason) {
    console.log("problem: %j", reason);
  });

function queryIdentityPoolRoles() {
  return new Promise(function(resolve, reject) {
    cognitoIdentity.getIdentityPoolRoles({
      IdentityPoolId: settings.get('identityPoolId'),
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("queryIdentityPoolRoles -> %j", data);
      return resolve(data);
    });
  });
}

function queryUsers() {
  return new Promise(function(resolve, reject) {
    cognitoIdentityServiceProvider.listUsers({
      UserPoolId: settings.get('userPoolId'),
      AttributesToGet: ['email'],
      PaginationToken: null // todo: scale up to support multiple queries using pagination tokens
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("listUsers -> %j", data);
      return resolve(data);
    });
  });
}
