'use strict';

var fs = require('fs');
var path = require('path');

var AWS = require('aws-sdk');

var setupPools = require('./lib/setup-pools');

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
var amazonIAM = new AWS.IAM();

Promise.resolve()
  .then(setupPools)
  .then(setupBuckets)
  // error catch-all
  .catch(function(reason) {
    console.log("problem: %j", typeof reason === 'object' ? reason.toString() : reason);
  });

function setupBuckets() {
  return Promise.resolve()
    // create and configure bucket
    .then(createBucket)
    .then(attachCORSToBucket)
    .then(createBucketPolicy)
    .then(attachBucketPolicyToAuthRole)

  ;
}

function createBucket() {
  if (!config.phase.buckets) {
    return Promise.resolve();
  }
  return new Promise(function(resolve, reject) {
    bucket.createBucket(function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("createBucket -> %j", data);
      return resolve(data);
    });
  });
}

function attachCORSToBucket() {
  if (!config.phase.buckets) {
    return Promise.resolve();
  }
  // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putBucketCors-property
  var params = {
    // Bucket: (required value, given to S3 constructor)
    CORSConfiguration: {
      CORSRules: [{
        AllowedMethods: ['GET', 'PUT', 'POST'],
        AllowedOrigins: ['*'],
        AllowedHeaders: ['*'],
        ExposeHeaders: ['ETag', 'x-amz-meta-custom-header'],
        MaxAgeSeconds: 3000
      }]
    }
  };
  return new Promise(function(resolve, reject) {
    bucket.putBucketCors(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("putBucketCors -> %j", data);
      return resolve(data);
    });
  });
}

function writeFile() {
  if (!config.phase.buckets) {
    return Promise.resolve();
  }
  return new Promise(function(resolve, reject) {
    bucket.upload({
      Key: config.TEST_FILE_NAME,
      Body: 'the quick brown fox jumps over the lazy dog'
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("upload -> %j", data);
      return resolve(data);
    });
  });
}

function createBucketPolicy() {
  if (!config.phase.policies) {
    return Promise.resolve();
  }
  var policy = {
    Version: "2012-10-17",
    Statement: [{
      Effect: "Allow",
      Action: [
        "s3:GetObject",
        "s3:PutObject",
        "s3:putObjectACL"
      ],
      Resource: [
        "arn:aws:s3:::" + config.BUCKET_NAME + "/*"
      ]
    }]
  };
  var policyJson = JSON.stringify(policy, null, 2);
  var params = {
    // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#createPolicy-property
    PolicyName: config.AUTH_BUCKET_POLICY_NAME,
    Description: 'Write to bucket',
    PolicyDocument: policyJson,
  };
  return new Promise(function(resolve, reject) {
    amazonIAM.createPolicy(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("createPolicy -> %j", data);
      console.log("createPolicy -> arn:", data.Policy.Arn);
      settings.set('bucketAuthPolicyArn', data.Policy.Arn);
      return resolve(data);
    });
  });
}

function attachBucketPolicyToAuthRole() {
  if (!config.phase.policies) {
    return Promise.resolve();
  }
  var params = {
    // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#attachRolePolicy-property
    RoleName: config.AUTH_ROLE_NAME,
    PolicyArn: settings.get('bucketAuthPolicyArn'),
  };
  return new Promise(function(resolve, reject) {
    amazonIAM.attachRolePolicy(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("attachRolePolicy -> %j", data);
      return resolve(data);
    });
  });
}
