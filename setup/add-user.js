'use strict';

var AWS = require('aws-sdk');

var config = require('./lib/config');
var settings = require('./lib/settings');

AWS.config.region = config.REGION;

var cognitoIdentity = new AWS.CognitoIdentity();
var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

var parser = new(require('argparse').ArgumentParser)();
parser.addArgument(['-u', '--user'], {
  required: true
});
parser.addArgument(['-e', '--email'], {
  required: true
});
var args = parser.parseArgs();

Promise.resolve()
  .then(addUser)
  .catch(function(reason) {
    console.log("problem: %j", reason);
  });

function addUser() {
  return new Promise(function(resolve, reject) {
    cognitoIdentityServiceProvider.adminCreateUser({
      UserPoolId: settings.get('userPoolId'),
      Username: args.user,
      DesiredDeliveryMediums: ['EMAIL'],
      ForceAliasCreation: true,
      UserAttributes: [{
        Name: 'email',
        Value: args.email
      }],
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("adminCreateUser -> %j", data);
      return resolve(data);
    });
  });
}
