'use strict';

angular.module('demoApp')

.controller('UserLogoutController', function($scope, CognitoUser) {

  // public interface
  var self = this;
  self.logout = logout;
  self.deregister = deregister;
  self.interactionDisabled = false;
  // message: User.enableInteraction
  // message: User.disableInteraction

  $scope.$on('User.disableInteraction', function() {
    self.interactionDisabled = true;
  });

  $scope.$on('User.enableInteraction', function() {
    self.interactionDisabled = false;
  });

  function logout() {
    $scope.$emit('User.disableInteraction');
    CognitoUser.logout()
      .then(function() {
        $scope.$emit('User.enableInteraction');
      })
      .catch(function(err) {
        $scope.$emit('User.error', err);
        $scope.$emit('User.enableInteraction');
      });
  }

  function deregister() {
    $scope.$emit('User.disableInteraction');
    CognitoUser.deregister()
      .then(function() {
        $scope.$emit('User.enableInteraction');
      })
      .catch(function(err) {
        $scope.$emit('User.error', err);
        $scope.$emit('User.enableInteraction');
      });
  }
})

.component('userLogout', {
  templateUrl: 'scripts/user/user-logout.html',
  controller: 'UserLogoutController',
  controllerAs: 'vm',
  bindings: {
    enableDeregistration: '<',
  }
})

;
