'use strict';

'HANDLE WITH CARE!!';

var AWS = require('aws-sdk');

var config = require('./config');
var settings = require('./settings');

AWS.config.region = config.REGION;

var bucket = new AWS.S3({
  params: {
    Bucket: config.BUCKET_NAME,
    region: config.REGION,
  }
});

var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
var cognitoIdentity = new AWS.CognitoIdentity();
var amazonIAM = new AWS.IAM();

function teardownBuckets() {
  return Promise.resolve()
    // empty and remove bucket
    .then(function() {
      return detachBucketPolicyFromAuthRole(settings.get('bucketAuthPolicyArn'));
    })
    .then(function() {
      return deletePolicy(settings.get('bucketAuthPolicyArn'));
    })
    .then(deleteFiles)
    .then(deleteBucket)

  ;
}

function deleteBucket() {
  if (!config.phase.buckets) {
    return Promise.resolve();
  }
  return new Promise(function(resolve, reject) {
    bucket.deleteBucket(function(err, data) {
      if (err) {
        return reject(err);
        return;
      }
      console.log("deleteBucket -> %j", data);
      return resolve(data);
    });
  });
}

function deleteFiles() {
  if (!config.phase.buckets) {
    return Promise.resolve();
  }
  return new Promise(function(resolve, reject) {
    // note that deleteObjects() does not take '*' as Key
    bucket.deleteObjects({
      Delete: {
        Objects: [{
          Key: config.TEST_FILE_NAME,
        }],
        Quiet: false,
      }
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("deleteObjects -> %j", data);
      return resolve(data);
    });
  });
}

function deletePolicy(policyArn) {
  if (!config.phase.roles) {
    return Promise.resolve();
  }
  var params = {
    PolicyArn: policyArn,
  };
  return new Promise(function(resolve, reject) {
    amazonIAM.deletePolicy(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("deletePolicy -> %j", data);
      return resolve(data);
    });
  });
}

function detachBucketPolicyFromAuthRole(policyArn) {
  if (!config.phase.roles) {
    return Promise.resolve();
  }
  var params = {
    RoleName: config.AUTH_ROLE_NAME,
    PolicyArn: policyArn,
  };
  return new Promise(function(resolve, reject) {
    amazonIAM.detachRolePolicy(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("detachRolePolicy -> %j", data);
      return resolve(data);
    });
  });
}

module.exports = teardownBuckets;
