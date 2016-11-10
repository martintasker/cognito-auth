'use strict';

/* globals AWS */

angular.module('demoApp')

.factory('UploadService', function($q, CognitoAuthConfig) {

  var BUCKET_NAME = 's3-test.data.databatix.com';
  var ROOT_PATH = "https://s3-" + CognitoAuthConfig.AWS_REGION + ".amazonaws.com/" + BUCKET_NAME;

  function upload(file, target, contentType, progressCb) {
    if (CognitoAuthConfig.TRACE) {
      console.log("UploadService.upload()", typeof file === 'string' ? 'String(' + file.length + ' bytes)' : file, "to", target, 'type', contentType);
    }

    var bucket = new AWS.S3({
      params: {
        Bucket: BUCKET_NAME,
      }
    });

    var params = {
      Key: target,
      ContentType: contentType,
      Body: file,
      CacheControl: 'no-cache',
      ACL: 'public-read'
    };

    var options = {
      partSize: 5242880,
      queueSize: 4,
    };

    var sending = $q.defer();
    bucket.upload(params, options)
    .on('httpUploadProgress', function(progress) {
      if (progressCb) {
        progressCb(progress);
      }
    })
    .send(function(err) {
      if (err) {
        sending.reject(err);
        return;
      }
      sending.resolve();
    });
    return sending.promise;
  }

  // public interface
  return {
    upload: upload,
    ROOT_PATH: ROOT_PATH,
  };
})

;
