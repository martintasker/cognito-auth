'use strict';

angular.module('demoApp')

.controller('UploaderController', function($scope, CognitoUser, UploadService) {

  // public interface
  var self = this;
  self.errorMessage = "";
  self.successMessage = "";
  self.progressMessage = '';
  self.uploaded = false;
  self.upload = upload;
  self.target = UploadService.ROOT_PATH + '/' + self.path;
  self.isLoggedIn = CognitoUser.isLoggedIn;

  // implementation

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
    UploadService.upload(file, self.path, self.contentType, progressCb)
      .then(function() {
        self.successMessage = "sent " + file.name;
        self.uploaded = true;
      })
      .catch(function(err) {
        self.errorMessage = err;
      });
  }

  function progressCb(info) {
    console.log("progressCb:", info);
    var kbLoaded = Math.floor(info.loaded / 1024);
    var kbTotal = Math.floor(info.total / 1024);
    self.progressMessage = "Uploaded " + kbLoaded + "kB of " + kbTotal + "kB";
    $scope.$digest();
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
