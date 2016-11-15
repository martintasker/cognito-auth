'use strict';

angular.module('demoApp')

.controller('UserPasswordConfirmController', function($scope, CognitoAuth) {

  // public interface
  var self = this;
  self.confirm = confirm;
  self.email = "";
  self.code = "";
  self.password = "";
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

  function confirm() {
    $scope.$emit('User.disableInteraction');
    CognitoAuth.setPasswordWithCode(self.username, self.password, self.code)
      .then(function(cognitoUser) {
        self.username = '';
        self.password = '';
        self.code = '';
        $scope.form.$setPristine();
        $scope.form.$setUntouched();
        $scope.$emit('User.enableInteraction');
        $scope.$emit('User.success', 'Password reset successful');
        return cognitoUser;
      })
      .catch(function(err) {
        self.username = '';
        self.password = '';
        self.code = '';
        $scope.form.$setPristine();
        $scope.form.$setUntouched();
        $scope.$emit('User.error', err);
        $scope.$emit('User.enableInteraction');
      });
  }
})

.component('userPasswordConfirm', {
  templateUrl: 'scripts/user/user-password-confirm.html',
  controller: 'UserPasswordConfirmController',
  controllerAs: 'vm',
})

;
