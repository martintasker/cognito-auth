'use strict';

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

var amazonIAM = new AWS.IAM();

function setupBuckets() {
  return Promise.resolve()
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
      settings.set('bucketName', config.BUCKET_NAME);
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

function createBucketPolicy() {
  if (!config.phase.buckets) {
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
        "arn:aws:s3:::" + config.BUCKET_NAME + "/" + config.UPLOAD_FILE_NAME,
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
  if (!config.phase.buckets) {
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

module.exports = setupBuckets;
