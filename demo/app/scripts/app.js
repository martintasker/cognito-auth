'use strict';

var settings = {
  "userPoolId": "eu-west-1_2mZqlM8LH",
  "applicationId": "4r317aae4nln2kao09knpurlc2",
  "identityPoolId": "eu-west-1:b0f2d0d1-615c-44c8-9708-2e71275e96b6",
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
