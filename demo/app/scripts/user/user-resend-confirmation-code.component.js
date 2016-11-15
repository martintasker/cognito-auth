'use strict';

angular.module('demoApp')

.controller('UserResendConfirmationCodeController', function($scope, CognitoAuth) {

  // public interface
  var self = this;
  self.resend = resend;
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

  function resend() {
    $scope.$emit('User.disableInteraction');
    CognitoAuth.resendConfirmationCode(self.username)
      .then(function() {
        self.username = '';
        $scope.form.$setPristine();
        $scope.form.$setUntouched();
        $scope.$emit('User.enableInteraction');
        $scope.$emit('User.success', 'Re-send successful');
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

.component('userResendConfirmationCode', {
  templateUrl: 'scripts/user/user-resend-confirmation-code.html',
  controller: 'UserResendConfirmationCodeController',
  controllerAs: 'vm',
})

;
