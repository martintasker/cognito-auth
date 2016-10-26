'use strict';

angular.module('demoApp', [
  'ngFileUpload',
  'mpt.cognito-auth'
])

.constant('CognitoAuthConfig', {
  AWS_REGION: 'eu-west-1',
  AWS_USER_POOL_ID: 'eu-west-1_eetM2eus0', // arn:aws:cognito-idp:eu-west-1:564628766628:userpool/<id> for ARN
  // note: FBEmmAdminAuth pre-signup lambda prevents arbitrary registration into above user pool
  AWS_APP_ID: '26qrure8tus888itr3ou66eci0',
  AWS_ID_POOL_ID: 'eu-west-1:6ac29173-d3b8-4bf5-8df9-e4ba50bf7184',
})

;
