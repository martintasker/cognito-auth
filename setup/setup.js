'use strict';

var AWS = require('aws-sdk');

var config = require('./lib/config');

AWS.config.region = config.MY_REGION;

var bucket = new AWS.S3({
  params: {
    Bucket: config.BUCKET_NAME,
    region: config.BUCKET_REGION,
  }
});

createBucket()
  .then(writeFile)
  .catch(function(reason) {
    console.log("problem: %j", reason);
  });

function createBucket() {
  return new Promise(function(resolve, reject) {
    bucket.createBucket(function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

function writeFile() {
  return new Promise(function(resolve, reject) {
    bucket.upload({
      Key: config.TEST_FILE_NAME,
      Body: 'the quick brown fox jumps over the lazy dog'
    }, function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}
