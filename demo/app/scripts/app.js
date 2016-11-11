'use strict';

var settings = {
  "userPoolId": "eu-west-1_VEI6l4NJO",
  "applicationId": "5t2t2tabrhs03qhemn74suoblb",
  "identityPoolId": "eu-west-1:a06a7a1c-740f-446c-bd37-3fbb760c2fba",
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
