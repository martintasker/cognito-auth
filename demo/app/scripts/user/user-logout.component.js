'use strict';

angular.module('demoApp')

.controller('UserLogoutController', function($scope, CognitoAuth) {

  // public interface
  var self = this;
  self.logout = logout;
  self.isLoggedIn = CognitoAuth.isLoggedIn;

  // implementation

  function logout() {
    $scope.$emit('User.disableInteraction');
    CognitoAuth.logout()
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
})

;
