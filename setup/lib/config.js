'use strict';

var ini = require('ini');
var fs = require('fs');

function getDefaultRegion() {
  var config = ini.parse(fs.readFileSync(homeDirectory() + '/.aws/config', 'utf-8'));
  var region = config.default.region;
  return region;
}

function homeDirectory() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

// override any of the below if you want to
exports.REGION = getDefaultRegion();
exports.BUCKET_NAME = 'test.cognito-auth.example.io';
exports.UPLOAD_FILE_NAME = 'file.pdf'; // the only user-uploadable file
exports.USER_POOL_NAME = 'cognito-auth Test User Pool';
exports.APP_NAME = 'cognito-auth Test Application';
exports.POOL_NAME = 'CognitoAuthTestIdentityPool';
exports.AUTH_ROLE_NAME = 'CognitoAuthTest-AuthRole';
exports.UNAUTH_ROLE_NAME = 'CognitoAuthTest-UnauthRole';
exports.AUTH_BUCKET_POLICY_NAME = exports.AUTH_ROLE_NAME + '-WriteBucket';

exports.phase = {
  buckets: true,
  pools: true,
  roles: true,
  policies: true,
};
