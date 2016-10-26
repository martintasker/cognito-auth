'use strict';

angular.module('demoApp')

.controller('UploaderController', function($scope, CognitoUser, UploadService) {

  // public interface
  var self = this;
  self.errorMessage = "";
  self.successMessage = "";
  self.uploaded = false;
  self.upload = upload;
  self.target = UploadService.ROOT_PATH + '/' + self.path;
  self.isLoggedIn = isLoggedIn;

  function upload(file) {
    self.errorMessage = "";
    self.successMessage = "";
    if (!file) {
      return;
    }
    if (!file.name.toLowerCase().match(self.pattern)) {
      self.errorMessage = self.matchError;
      return;
    }

    self.successMessage = "sending " + file.name + " ...";
    UploadService.upload(file, self.path, self.contentType)
      .then(function() {
        self.successMessage = "sent " + file.name;
        self.uploaded = true;
      })
      .catch(function(err) {
        self.errorMessage = err;
      });
  }

  function isLoggedIn() {
    return CognitoUser.isLoggedIn();
  }
})

.component('awsUploader', {
  templateUrl: 'scripts/uploader/uploader.html',
  controller: 'UploaderController',
  controllerAs: 'vm',
  bindings: {
    title: '@',
    path: '@',
    pattern: '@',
    contentType: '@',
    matchError: '@',
  }
})

;
