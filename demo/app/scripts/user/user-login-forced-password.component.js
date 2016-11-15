'use strict';

angular.module('demoApp')

.controller('UserLoginForcedPasswordController', function($scope, CognitoAuth) {

  // public interface
  var self = this;
  self.completeLogin = completeLogin;
  self.password = "";
  self.interactionDisabled = false;
  // message: User.enableInteraction
  // message: User.disableInteraction

  $scope.$on('User.disableInteraction', function() {
    self.interactionDisabled = true;
  });

  $scope.$on('User.enableInteraction', function() {
    self.interactionDisabled = false;
  });

  function completeLogin() {
    $scope.$emit('User.disableInteraction');
    CognitoAuth.login(null, self.password)
      .then(function(cognitoUser) {
        self.password = '';
        $scope.form.$setPristine();
        $scope.form.$setUntouched();
        $scope.$emit('User.enableInteraction');
        return cognitoUser;
      })
      .catch(function(err) {
        self.password = '';
        $scope.form.$setPristine();
        $scope.form.$setUntouched();
        $scope.$emit('User.error', err);
        $scope.$emit('User.enableInteraction');
      });
  }
})

.component('userLoginForcedPassword', {
  templateUrl: 'scripts/user/user-login-forced-password.html',
  controller: 'UserLoginForcedPasswordController',
  controllerAs: 'vm',
})

;
