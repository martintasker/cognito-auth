'use strict';

var settings = {
  "userPoolId": "eu-west-1_X44yuIZJd",
  "applicationId": "39hrf722hk1n7pa0ldgcbvfuo0",
  "identityPoolId": "eu-west-1:a3c637d7-ccd9-4405-96f0-522ba7ee5394",
  "bucketName": "s3-test.databatix.com",
};

angular.module('demoApp', [
  'ngFileUpload',
  'mpt.cognito-auth'
])

.constant('CognitoAuthConfig', {
  AWS_REGION: 'eu-west-1',
  AWS_USER_POOL_ID: settings.userPoolId,
  AWS_APP_ID: settings.applicationId,
  AWS_ID_POOL_ID: settings.identityPoolId,
  TRACE: true,
})

.constant('CognitoAuthS3Config', {
  BUCKET_REGION: 'eu-west-1',
  BUCKET_NAME: settings.bucketName,
  TRACE: true,
})

;
