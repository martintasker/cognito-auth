'use strict';

angular.module('demoApp')

.controller('UserLoginController', function($scope, CognitoUser) {

  // public interface
  var self = this;
  self.login = login;
  self.register = register;
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

  function login() {
    $scope.$emit('User.disableInteraction');
    CognitoUser.login(self.username, self.password)
      .then(function(cognitoUser) {
        $scope.loginForm.$setPristine();
        $scope.loginForm.$setUntouched();
        self.username = '';
        self.password = '';
        $scope.$emit('User.enableInteraction');
        return cognitoUser;
      })
      .catch(function(err) {
        $scope.loginForm.$setPristine();
        $scope.loginForm.$setUntouched();
        self.username = '';
        self.password = '';
        $scope.$emit('User.error', err);
        $scope.$emit('User.enableInteraction');
      });
  }

  function register() {
    $scope.$emit('User.disableInteraction');
    CognitoUser.register(self.username, self.password, self.username, '')
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

.component('userLogin', {
  templateUrl: 'scripts/user/user-login.html',
  controller: 'UserLoginController',
  controllerAs: 'vm',
  bindings: {
    enableRegistration: '<',
  }
})

;