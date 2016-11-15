'use strict';

'HANDLE WITH CARE!!';

var AWS = require('aws-sdk');

var config = require('./config');
var settings = require('./settings');

AWS.config.region = config.REGION;

var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
var cognitoIdentity = new AWS.CognitoIdentity();
var amazonIAM = new AWS.IAM();

function teardownPools() {
  return Promise.resolve()
    // remove roles
    .then(function() {
      return deleteRole(config.UNAUTH_ROLE_NAME);
    })
    .then(function() {
      return deleteRole(config.AUTH_ROLE_NAME);
    })
    // remove pools
    .then(function() {
      return deleteIdentityPool(settings.get('identityPoolId'));
    })
    .then(function() {
      return deleteUserPoolClient(settings.get('userPoolId'), settings.get('applicationId'));
    })
    .then(function() {
      return deleteUserPool(settings.get('userPoolId'));
    })

  ;
}

function deleteUserPool(userPoolId) {
  console.log("deleteUserPool", userPoolId);
  return new Promise(function(resolve, reject) {
    cognitoIdentityServiceProvider.deleteUserPool({
      UserPoolId: userPoolId
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("deleteUserPool -> %j", data);
      return resolve(data);
    });
  });
}

function deleteUserPoolClient(userPoolId, userPoolClientId) {
  console.log("deleteUserPoolClient", userPoolClientId);
  return new Promise(function(resolve, reject) {
    cognitoIdentityServiceProvider.deleteUserPoolClient({
      UserPoolId: userPoolId,
      ClientId: userPoolClientId,
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("deleteUserPoolClient -> %j", data);
      return resolve(data);
    });
  });
}

function deleteIdentityPool(identityPoolId) {
  console.log("deleteIdentityPool", identityPoolId);
  return new Promise(function(resolve, reject) {
    cognitoIdentity.deleteIdentityPool({
      IdentityPoolId: identityPoolId,
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("deleteIdentityPool -> %j", data);
      return resolve(data);
    });
  });
}

function deleteRole(roleName) {
  var params = {
    RoleName: roleName,
  };
  return new Promise(function(resolve, reject) {
    amazonIAM.deleteRole(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("deleteRole -> %j", data);
      return resolve(data);
    });
  });
}

module.exports = teardownPools;
