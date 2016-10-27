'use strict';

var settings = {
  "userPoolId": "eu-west-1_ffLnxTYMT",
  "applicationId": "7tdtigfomm7106g0vpv0lcpftf",
  "identityPoolId": "eu-west-1:e76fb2d3-cdbf-4d03-9062-862b997f765a",
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
