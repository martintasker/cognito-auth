'use strict';

var settings = {
  "userPoolId": "eu-west-1_EIOglQ6EY",
  "applicationId": "164lda775p23snr3qq25vttsa6",
  "identityPoolId": "eu-west-1:049af02f-e3eb-4ddf-9654-a2a0ade46922",
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
