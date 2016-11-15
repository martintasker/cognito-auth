'use strict';

angular.module('demoApp')

.controller('UserPasswordRequestController', function($scope, CognitoAuth) {

  // public interface
  var self = this;
  self.request = request;
  self.username = "";
  self.interactionDisabled = false;
  // message: User.enableInteraction
  // message: User.disableInteraction

  // implementation

  $scope.$on('User.disableInteraction', function() {
    self.interactionDisabled = true;
  });

  $scope.$on('User.enableInteraction', function() {
    self.interactionDisabled = false;
  });

  function request() {
    $scope.$emit('User.disableInteraction');
    CognitoAuth.requestNewPasswordCode(self.username)
      .then(function() {
        self.username = '';
        $scope.form.$setPristine();
        $scope.form.$setUntouched();
        $scope.$emit('User.enableInteraction');
        $scope.$emit('User.success', 'Request successful: code sent');
        return;
      })
      .catch(function(err) {
        self.username = '';
        $scope.form.$setPristine();
        $scope.form.$setUntouched();
        $scope.$emit('User.error', err);
        $scope.$emit('User.enableInteraction');
      });
  }
})

.component('userPasswordRequest', {
  templateUrl: 'scripts/user/user-password-request.html',
  controller: 'UserPasswordRequestController',
  controllerAs: 'vm',
})

;
