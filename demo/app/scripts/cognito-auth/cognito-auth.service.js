'use strict';

/* globals AWS */
/* globals AWSCognito */

angular.module('mpt.cognito-auth')

.factory('CognitoAuth', function($rootScope, CognitoAuthConfig, $q, $timeout) {

  // get API from pure JavaScript version of the service, and Angularize its promises and callbacks

  var API = CognitoAuth(CognitoAuthConfig, broadcastCallbackEvents);

  var promiseCalls = [ // must cover exactly the functions in the public API which return promises
    'register',
    'confirmRegistration',
    'resendConfirmationCode',
    'login',
    'logout',
    'deregister',
    'changePassword',
    'requestNewPasswordCode',
    'setPasswordWithCode',
  ];

  promiseCalls.forEach(function(promiseCall) {
    API[promiseCall] = angularizePromises(API[promiseCall]);
  });

  return API;

  // helper functions

  function broadcastCallbackEvents(message, parms) {
    $timeout(function() {
      $rootScope.$broadcast(message, parms);
    }, 0);
  }

  function angularizePromises(pureJavaScriptFunction) {
    return function() {
      var originalArguments = arguments;
      var result = $q.defer();
      Promise.resolve()
        .then(function() {
          return pureJavaScriptFunction.apply(CognitoAuth, originalArguments);
        })
        .then(function(value) {
          result.resolve(value);
        })
        .catch(function(reason) {
          result.reject(reason);
        });
      return result.promise;
    }
  }
})

;
