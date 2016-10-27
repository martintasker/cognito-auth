'use strict';

var ini = require('ini');
var fs = require('fs');

function getDefaultRegion() {
  var config = ini.parse(fs.readFileSync(homeDirectory() + '/.aws/config', 'utf-8'));
  var region = config.default.region;
  return region;
}

function homeDirectory() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

// override any of the below if you want to
exports.MY_REGION = getDefaultRegion();
exports.BUCKET_REGION = exports.MY_REGION;
exports.BUCKET_NAME = 's3-test.data.databatix.com';
exports.TEST_FILE_NAME = 'test.txt';
