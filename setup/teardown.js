'use strict';

'HANDLE WITH CARE: if you use this after you\'ve set up and got users, then you\'ll delete them and their data!!';

var AWS = require('aws-sdk');

var config = require('./lib/config');
var settings = require('./lib/settings');

AWS.config.region = config.REGION;

var bucket = new AWS.S3({
  params: {
    Bucket: config.BUCKET_NAME,
    region: config.REGION,
  }
});

var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
var cognitoIdentity = new AWS.CognitoIdentity();
var amazonIAM = new AWS.IAM();

Promise.resolve()
  .then(function() {
    return deleteRole();
  })
  .then(function() {
    return deleteIdentityPool(settings.get('identityPoolId'));
  })
  .then(function() {
    return deleteUserPoolClient(settings.get('userPoolId'), settings.get('applicationId'));
  })
  .then(function() {
    return deleteUserPool(settings.get('userPoolId'));
  })
  .then(deleteFiles)
  .then(deleteBucket)
  .catch(function(reason) {
    console.log("problem: %j", reason);
  });

function deleteBucket() {
  if (!config.phase.pools) {
    return Promise.resolve();
  }
  return new Promise(function(resolve, reject) {
    bucket.deleteBucket(function(err, data) {
      if (err) {
        return reject(err);
        return;
      }
      console.log("deleteBucket -> %j", data);
      return resolve(data);
    });
  });
}

function deleteFiles() {
  if (!config.phase.pools) {
    return Promise.resolve();
  }
  return new Promise(function(resolve, reject) {
    // note that deleteObjects() does not take '*' as Key
    bucket.deleteObjects({
      Delete: {
        Objects: [{
          Key: config.TEST_FILE_NAME,
        }],
        Quiet: false,
      }
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("deleteObjects -> %j", data);
      return resolve(data);
    });
  });
}

function deleteUserPool(userPoolId) {
  if (!config.phase.pools) {
    return Promise.resolve();
  }
  console.log("deleteUserPool", userPoolId);
  return new Promise(function(resolve, reject) {
    cognitoIdentityServiceProvider.deleteUserPool({
      UserPoolId: userPoolId
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("deleteUserPool -> %j", data);
      return resolve(data);
    });
  });
}

function deleteUserPoolClient(userPoolId, userPoolClientId) {
  if (!config.phase.pools) {
    return Promise.resolve();
  }
  console.log("deleteUserPoolClient", userPoolClientId);
  return new Promise(function(resolve, reject) {
    cognitoIdentityServiceProvider.deleteUserPoolClient({
      UserPoolId: userPoolId,
      ClientId: userPoolClientId,
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("deleteUserPoolClient -> %j", data);
      return resolve(data);
    });
  });
}

function deleteIdentityPool(identityPoolId) {
  if (!config.phase.pools) {
    return Promise.resolve();
  }
  console.log("deleteIdentityPool", identityPoolId);
  return new Promise(function(resolve, reject) {
    cognitoIdentity.deleteIdentityPool({
      IdentityPoolId: identityPoolId,
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("deleteIdentityPool -> %j", data);
      return resolve(data);
    });
  });
}

function deleteRole() {
  if (!config.phase.roles) {
    return Promise.resolve();
  }
  var params = {
    RoleName: config.AUTH_ROLE_NAME,
  };
  return new Promise(function(resolve, reject) {
    amazonIAM.deleteRole(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("deleteRole -> %j", data);
      return resolve(data);
    });
  });
}
