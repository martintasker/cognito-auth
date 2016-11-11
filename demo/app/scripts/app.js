'use strict';

var settings = {
  "userPoolId": "eu-west-1_7PTOOXzvX",
  "applicationId": "670jopvfcn2u92a16hv438067i",
  "identityPoolId": "eu-west-1:90a5f6f5-7dce-48d6-b689-fb528f315eb6",
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
