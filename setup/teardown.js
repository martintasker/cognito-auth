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

Promise.resolve()
  .then(deleteFiles)
  .then(deleteBucket)
  .catch(function(reason) {
    console.log("problem: %j", reason);
  });

function deleteBucket() {
  return new Promise(function(resolve, reject) {
    bucket.deleteBucket(function(err, data) {
      if (err) {
        reject(err);
      }
      console.log("deleteBucket -> %j", data);
      resolve(data);
    });
  });
}

function deleteFiles() {
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
        reject(err);
      }
      console.log("deleteObjects -> %j", data);
      resolve(data);
    });
  });
}
