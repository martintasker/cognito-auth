'use strict';

/* globals AWS */

angular.module('demoApp')

.factory('UploadService', function($q, CognitoAuthS3Config) {

  var ROOT_PATH = "https://s3-" + CognitoAuthS3Config.BUCKET_REGION + ".amazonaws.com/" + CognitoAuthS3Config.BUCKET_NAME;

  function upload(file, target, contentType, progressCb) {
    if (CognitoAuthS3Config.TRACE) {
      console.log("UploadService.upload()", typeof file === 'string' ? 'String(' + file.length + ' bytes)' : file, "to", target, 'type', contentType);
    }

    var bucket = new AWS.S3({
      params: {
        Bucket: CognitoAuthS3Config.BUCKET_NAME,
        Region: CognitoAuthS3Config.BUCKET_REGION,
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
