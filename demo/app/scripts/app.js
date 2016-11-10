'use strict';

var settings = {
  "userPoolId": "eu-west-1_ZAX9FKyB7",
  "applicationId": "4o2m24np5247jufvp4vcr8va0h",
  "identityPoolId": "eu-west-1:3d05836c-00ca-4c4a-83e7-113aa8b17807",
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

;
