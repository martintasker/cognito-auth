'use strict';

var settings = {
  "userPoolId": "eu-west-1_G0YvzBXYO",
  "applicationId": "2hrdoa7ujp03dpfq095c42uui1",
  "identityPoolId": "eu-west-1:29d7b504-a857-4f4e-97aa-fdaf6d14b19a",
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
