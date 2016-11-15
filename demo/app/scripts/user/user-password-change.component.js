'use strict';

angular.module('demoApp')

.controller('UserPasswordChangeController', function($scope, CognitoAuth) {

  // public interface
  var self = this;
  self.change = change;
  self.oldPassword = "";
  self.password = "";
  self.interactionDisabled = false;
  self.isLoggedIn = CognitoAuth.isLoggedIn;
  // message: User.enableInteraction
  // message: User.disableInteraction

  // implementation

  $scope.$on('User.disableInteraction', function() {
    self.interactionDisabled = true;
  });

  $scope.$on('User.enableInteraction', function() {
    self.interactionDisabled = false;
  });

  function change() {
    $scope.$emit('User.disableInteraction');
    CognitoAuth.changePassword(self.oldPassword, self.password)
      .then(function(cognitoUser) {
        self.oldPassword = '';
        self.password = '';
        $scope.form.$setPristine();
        $scope.form.$setUntouched();
        $scope.$emit('User.enableInteraction');
        $scope.$emit('User.success', 'Password change successful');
        return cognitoUser;
      })
      .catch(function(err) {
        self.oldPassword = '';
        self.password = '';
        $scope.form.$setPristine();
        $scope.form.$setUntouched();
        $scope.$emit('User.error', err);
        $scope.$emit('User.enableInteraction');
      });
  }
})

.component('userPasswordChange', {
  templateUrl: 'scripts/user/user-password-change.html',
  controller: 'UserPasswordChangeController',
  controllerAs: 'vm',
})

;
