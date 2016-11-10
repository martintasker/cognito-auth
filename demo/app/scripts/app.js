'use strict';

var settings = {
  "userPoolId": "eu-west-1_X4PEVjSAX",
  "applicationId": "218jeqiophtiq4p2f845u1t824",
  "identityPoolId": "eu-west-1:5d044106-bf5e-4528-9f88-e95a185e9667",
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
