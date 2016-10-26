'use strict';

var AWS = require('aws-sdk');
var ini = require('ini');
var fs = require('fs');

var MY_REGION = getDefaultRegion(); // or just override
var BUCKET_REGION = MY_REGION; // or override
var BUCKET_NAME = 's3-test.data.databatix.com'; // or change

var TEST_FILE_NAME = 'test.txt';

function getDefaultRegion() {
  var config = ini.parse(fs.readFileSync(homeDirectory() + '/.aws/config', 'utf-8'));
  var region = config.default.region;
  return region;
}

function homeDirectory() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

AWS.config.region = MY_REGION;

var bucket = new AWS.S3({
  params: {
    Bucket: BUCKET_NAME,
    region: BUCKET_REGION,
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
      Key: TEST_FILE_NAME,
      Body: 'the quick brown fox jumps over the lazy dog'
    }, function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}
