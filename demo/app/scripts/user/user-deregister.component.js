'use strict';

angular.module('demoApp')

.controller('UserDeregisterController', function($scope, CognitoAuth) {

  // public interface
  var self = this;
  self.deregister = deregister;
  self.isLoggedIn = CognitoAuth.isLoggedIn;

  function deregister() {
    $scope.$emit('User.disableInteraction');
    CognitoAuth.deregister()
      .then(function() {
        $scope.$emit('User.success', 'Deregistration successful');
        $scope.$emit('User.enableInteraction');
      })
      .catch(function(err) {
        $scope.$emit('User.error', err);
        $scope.$emit('User.enableInteraction');
      });
  }
})

.component('userDeregister', {
  templateUrl: 'scripts/user/user-deregister.html',
  controller: 'UserDeregisterController',
  controllerAs: 'vm',
})

;
