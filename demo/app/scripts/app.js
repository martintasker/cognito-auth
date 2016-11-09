'use strict';

var settings = {
  "userPoolId": "eu-west-1_DYCUFq9MD",
  "applicationId": "4gb9357vdlij943svpk31h6u6h",
  "identityPoolId": "eu-west-1:f7e84ba8-82bf-4fee-8c8d-e9bcc790b045",
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
})

;
