'use strict';

var settings = {
  "userPoolId": "eu-west-1_aqBlGnUSH",
  "applicationId": "54fvujb7qd8mujom06jaaak234",
  "identityPoolId": "eu-west-1:d759abec-1e55-4986-b24f-80d8288389b6",
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
