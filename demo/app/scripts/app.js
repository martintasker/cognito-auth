'use strict';

var settings = {
  "userPoolId": "eu-west-1_GcpQ4aaeY",
  "applicationId": "47no7mi1s52fgdt0erccq0vn8l",
  "identityPoolId": "eu-west-1:5ac169f9-eac3-4737-ae92-618802f45d9b",
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
