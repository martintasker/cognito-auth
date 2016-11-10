'use strict';

angular.module('demoApp')

.controller('UserConfirmController', function($scope, CognitoUser) {

  // public interface
  var self = this;
  self.confirm = confirm;
  self.username = "";
  self.code = "";
  self.interactionDisabled = false;
  // message: User.enableInteraction
  // message: User.disableInteraction

  $scope.$on('User.disableInteraction', function() {
    self.interactionDisabled = true;
  });

  $scope.$on('User.enableInteraction', function() {
    self.interactionDisabled = false;
  });

  function confirm() {
    $scope.$emit('User.disableInteraction');
    CognitoUser.confirmRegistration(self.username, self.code)
      .then(function() {
        self.username = '';
        self.code = '';
        $scope.form.$setPristine();
        $scope.form.$setUntouched();
        $scope.$emit('User.enableInteraction');
        return;
      })
      .catch(function(err) {
        $scope.$emit('User.error', err);
        self.username = '';
        self.code = '';
        $scope.form.$setPristine();
        $scope.form.$setUntouched();
        $scope.$emit('User.enableInteraction');
      });
  }
})

.component('userConfirm', {
  templateUrl: 'scripts/user/user-confirm.html',
  controller: 'UserConfirmController',
  controllerAs: 'vm',
})

;
