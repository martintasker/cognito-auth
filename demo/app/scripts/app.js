'use strict';

var settings = {
  "userPoolId": "eu-west-1_Ew6TQtxFO",
  "applicationId": "7k9pl8flbmm8aqka8rtcpn91gi",
  "identityPoolId": "eu-west-1:bda6ef31-92b3-4ff1-990c-1fc504e991a0",
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
