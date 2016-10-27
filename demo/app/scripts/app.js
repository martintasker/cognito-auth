'use strict';

angular.module('demoApp', [
  'ngFileUpload',
  'mpt.cognito-auth'
])

.constant('CognitoAuthConfig', {
  AWS_REGION: 'eu-west-1',
  AWS_USER_POOL_ID: 'eu-west-1_QwNyuBilG',
  // note: FBEmmAdminAuth pre-signup lambda prevents arbitrary registration into above user pool
  AWS_APP_ID: '66m8segbilu6jmbvc8fptl1lmd',
  AWS_ID_POOL_ID: 'eu-west-1:2f344f65-d141-4c9f-9e1c-ea3ce86fcbd7',
})

;
