'use strict';

angular.module('demoApp')

.controller('UserRegisterController', function($scope, CognitoUser) {

  // public interface
  var self = this;
  self.register = register;
  self.email = "";
  self.username = "";
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

  function register() {
    $scope.$emit('User.disableInteraction');
    CognitoUser.register(self.username, self.password, self.email, '')
      .then(function() {
        return CognitoUser.login(self.username, self.password);
      })
      .then(function(cognitoUser) {
        $scope.$emit('User.enableInteraction');
        return cognitoUser;
      })
      .catch(function(err) {
        $scope.$emit('User.error', err);
        $scope.$emit('User.enableInteraction');
      });
  }
})

.component('userRegister', {
  templateUrl: 'scripts/user/user-register.html',
  controller: 'UserRegisterController',
  controllerAs: 'vm',
})

;