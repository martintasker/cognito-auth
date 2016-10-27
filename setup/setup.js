'use strict';

var AWS = require('aws-sdk');

var config = require('./lib/config');
var settings = require('./lib/settings');

AWS.config.region = config.MY_REGION;

var bucket = new AWS.S3({
  params: {
    Bucket: config.BUCKET_NAME,
    region: config.BUCKET_REGION,
  }
});

var cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
var cognitoIdentity = new AWS.CognitoIdentity();
var amazonIAM = new AWS.IAM();

Promise.resolve()
  // create a bucket, and send a test file to the bucket
  .then(createBucket)
  .then(writeFile)
  // create a user pool, a client app for it, and an identity pool for both of them
  .then(createUserPool)
  .then(createUserPoolClient)
  .then(createIdentityPool)
  // create auth role, then attach it to the identity pool
  .then(createAuthRole)
  .then(attachAuthRole)
  // error catch-all
  .catch(function(reason) {
    console.log("problem: %j", reason);
  });

function createBucket() {
  if (!config.phase.pools) {
    return Promise.resolve();
  }
  return new Promise(function(resolve, reject) {
    bucket.createBucket(function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("createBucket -> %j", data);
      return resolve(data);
    });
  });
}

function writeFile() {
  if (!config.phase.pools) {
    return Promise.resolve();
  }
  return new Promise(function(resolve, reject) {
    bucket.upload({
      Key: config.TEST_FILE_NAME,
      Body: 'the quick brown fox jumps over the lazy dog'
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("upload -> %j", data);
      return resolve(data);
    });
  });
}

function createUserPool() {
  if (!config.phase.pools) {
    return Promise.resolve();
  }
  var params = {
    // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#createUserPool-property
    PoolName: config.USER_POOL_NAME,
    AliasAttributes: ['email'], // sign in with email ID: this is what cognito-auth supports currently; 'phone_number' is also interesting
    AutoVerifiedAttributes: ['email'], // AWS recommends this setting, if the corresponding AliasAttribute is used
    LambdaConfig: {
      // PreAuthentication: 'STRING_VALUE',
    },
    MfaConfiguration: 'OFF', // this is all that cognito-auth will support, with minimum-lifecycle functionality
    Policies: {
      PasswordPolicy: { // feel free to configure
        MinimumLength: 8,
        RequireLowercase: true,
        RequireNumbers: true,
        RequireSymbols: false,
        RequireUppercase: false
      }
    },
  };
  return new Promise(function(resolve, reject) {
    cognitoIdentityServiceProvider.createUserPool(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      // console.log("createUserPool -> %j", data);
      console.log("createUserPool -> id:", data.UserPool.Id);
      settings.set('userPoolId', data.UserPool.Id);
      return resolve(data);
    });
  });
}

function createUserPoolClient() {
  if (!config.phase.pools) {
    return Promise.resolve();
  }
  var params = {
    // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#createUserPoolClient-property
    // in AWS console-speak, this is an "application" for a user pool; in API-speak, it's a "client"
    ClientName: config.APP_NAME,
    UserPoolId: settings.get('userPoolId'),
    ExplicitAuthFlows: ['ADMIN_NO_SRP_AUTH'], // possible future cognito-auth feature: support SRP auth
    GenerateSecret: false, // by requirement, since we generate temporary secrets on the fly at login time
    ReadAttributes: ['email'], // see http://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html
    RefreshTokenValidity: 0, // days, default 30; see http://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html
    // WriteAttributes: [], // required for profile maintenance
  };
  return new Promise(function(resolve, reject) {
    cognitoIdentityServiceProvider.createUserPoolClient(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("createUserPoolClient -> %j", data);
      console.log("createUserPoolClient -> id:", data.UserPoolClient.ClientId);
      settings.set('applicationId', data.UserPoolClient.ClientId);
      return resolve(data);
    });
  });
}

function createIdentityPool() {
  if (!config.phase.pools) {
    return Promise.resolve();
  }
  var params = {
    // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentity.html#createIdentityPool-property
    IdentityPoolName: config.POOL_NAME,
    CognitoIdentityProviders: [{
      ProviderName: 'cognito-idp.' + config.MY_REGION + '.amazonaws.com/' + settings.get('userPoolId'),
      ClientId: settings.get('applicationId'),
    }],
    AllowUnauthenticatedIdentities: false, // for now
    SupportedLoginProviders: { // eventually Facebook will go in here
    }
  };
  return new Promise(function(resolve, reject) {
    cognitoIdentity.createIdentityPool(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("createIdentityPool -> %j", data);
      console.log("createIdentityPool -> id:", data.IdentityPoolId);
      settings.set('identityPoolId', data.IdentityPoolId);
      return resolve(data);
    });
  });
}

function createAuthRole() {
  if (!config.phase.roles) {
    return Promise.resolve();
  }
  var policy = {
    Version: '2012-10-17',
    Statement: [{
      Effect: "Allow",
      Action: "sts:AssumeRoleWithWebIdentity",
      Principal: {
        Federated: "cognito-identity.amazonaws.com"
      },
      Condition: {
        StringEquals: {
          "cognito-identity.amazonaws.com:aud": settings.get('identityPoolId'),
        },
        'ForAnyValue:StringLike': {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        }
      }
    }]
  };
  var policyJson = JSON.stringify(policy, null, 2);
  var params = {
    // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#createRole-property
    RoleName: config.AUTH_ROLE_NAME,
    AssumeRolePolicyDocument: policyJson,
  };
  return new Promise(function(resolve, reject) {
    amazonIAM.createRole(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      // console.log("createRole -> %j", data);
      console.log("createRole -> arn:", data.Role.Arn);
      settings.set('authRoleArn', data.Role.Arn);
      return resolve(data);
    });
  });
}

function attachAuthRole() {
  if (!config.phase.roles) {
    return Promise.resolve();
  }
  var params = {
    // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentity.html#setIdentityPoolRoles-property
    IdentityPoolId: settings.get('identityPoolId'),
    Roles: {
      authenticated: settings.get('authRoleArn'),
    }
  };
  return new Promise(function(resolve, reject) {
    cognitoIdentity.setIdentityPoolRoles(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("setIdentityPoolRoles -> %j", data);
      return resolve(data);
    });
  });
}
