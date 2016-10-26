'use strict';

angular.module('demoApp')

.controller('UserController', function($scope) {

  // public interface
  var self = this;
  self.isLoggedIn = false;
  self.errorMessage = '';
  // message: CognitoUser.loggedIn
  // message: CognitoUser.loggedOut
  // message: User.enableInteraction
  // message: User.disableInteraction
  // message: User.error

  $scope.$on('User.disableInteraction', function() {
    $scope.$emit('User.error');
  });

  $scope.$on('User.error', function(event, error) {
    self.errorMessage = (error && error.toString()) || '';
  });

  $scope.$on('CognitoUser.loggedIn', function() {
    self.isLoggedIn = true;
  });

  $scope.$on('CognitoUser.loggedOut', function() {
    self.isLoggedIn = false;
  });
})

.component('user', {
  templateUrl: 'scripts/user/user.html',
  controller: 'UserController',
  controllerAs: 'vm',
  bindings: {}
})

;
