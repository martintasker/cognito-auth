'use strict';

var settings = {
  "userPoolId": "eu-west-1_DPG05EBd0",
  "applicationId": "1agcc52aqj3c0vb9so8rcn3veg",
  "identityPoolId": "eu-west-1:47b75868-564a-4553-b41c-d351fba13850",
  "bucketName": "test.cognito-auth.example.io"
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
