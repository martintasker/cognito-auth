'use strict';

var fs = require('fs');
var path = require('path');

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
  // create a bucket, and send a test file to the bucket
  .then(createBucket)
  .then(attachCORSToBucket)
  .then(writeFile)
  // create a user pool, a client app for it, and an identity pool for both of them
  .then(createUserPool)
  .then(createUserPoolClient)
  .then(createIdentityPool)
  // create auth role, then attach it to the identity pool
  .then(createAuthRole)
  .then(createUnauthRole)
  .then(attachRoles)
  // create the bucket policy, and attach it to the auth role
  .then(createBucketPolicy)
  .then(attachBucketPolicyToAuthRole)
  // error catch-all
  .catch(function(reason) {
    console.log("problem: %j", typeof reason === 'object' ? reason.toString() : reason);
  });

function createBucket() {
  if (!config.phase.buckets) {
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

function attachCORSToBucket() {
  if (!config.phase.buckets) {
    return Promise.resolve();
  }
  // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putBucketCors-property
  var params = {
    // Bucket: (required value, given to S3 constructor)
    CORSConfiguration: {
      CORSRules: [{
        AllowedMethods: ['GET', 'PUT', 'POST'],
        AllowedOrigins: ['*'],
        AllowedHeaders: ['*'],
        ExposeHeaders: ['ETag', 'x-amz-meta-custom-header'],
        MaxAgeSeconds: 3000
      }]
    }
  };
  return new Promise(function(resolve, reject) {
    bucket.putBucketCors(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("putBucketCors -> %j", data);
      return resolve(data);
    });
  });
}

function writeFile() {
  if (!config.phase.buckets) {
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
    LambdaConfig: {},
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
      ProviderName: 'cognito-idp.' + config.REGION + '.amazonaws.com/' + settings.get('userPoolId'),
      ClientId: settings.get('applicationId'),
    }],
    AllowUnauthenticatedIdentities: true, // required (probably!)
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

function createUnauthRole() {
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
          "cognito-identity.amazonaws.com:amr": "unauthenticated"
        }
      }
    }]
  };
  var policyJson = JSON.stringify(policy, null, 2);
  var params = {
    // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#createRole-property
    RoleName: config.UNAUTH_ROLE_NAME,
    AssumeRolePolicyDocument: policyJson,
  };
  return new Promise(function(resolve, reject) {
    amazonIAM.createRole(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      // console.log("createRole -> %j", data);
      console.log("createRole -> arn:", data.Role.Arn);
      settings.set('unauthRoleArn', data.Role.Arn);
      return resolve(data);
    });
  });
}

function attachRoles() {
  if (!config.phase.roles) {
    return Promise.resolve();
  }
  var params = {
    // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentity.html#setIdentityPoolRoles-property
    IdentityPoolId: settings.get('identityPoolId'),
    Roles: {
      authenticated: settings.get('authRoleArn'),
      unauthenticated: settings.get('unauthRoleArn'),
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

function createBucketPolicy() {
  if (!config.phase.policies) {
    return Promise.resolve();
  }
  var policy = {
    Version: "2012-10-17",
    Statement: [{
      Effect: "Allow",
      Action: [
        "s3:GetObject",
        "s3:PutObject",
        "s3:putObjectACL"
      ],
      Resource: [
        "arn:aws:s3:::" + config.BUCKET_NAME + "/*"
      ]
    }]
  };
  var policyJson = JSON.stringify(policy, null, 2);
  var params = {
    // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#createPolicy-property
    PolicyName: config.AUTH_BUCKET_POLICY_NAME,
    Description: 'Write to bucket',
    PolicyDocument: policyJson,
  };
  return new Promise(function(resolve, reject) {
    amazonIAM.createPolicy(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("createPolicy -> %j", data);
      console.log("createPolicy -> arn:", data.Policy.Arn);
      settings.set('bucketAuthPolicyArn', data.Policy.Arn);
      return resolve(data);
    });
  });
}

function attachBucketPolicyToAuthRole() {
  if (!config.phase.policies) {
    return Promise.resolve();
  }
  var params = {
    // see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#attachRolePolicy-property
    RoleName: config.AUTH_ROLE_NAME,
    PolicyArn: settings.get('bucketAuthPolicyArn'),
  };
  return new Promise(function(resolve, reject) {
    amazonIAM.attachRolePolicy(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log("attachRolePolicy -> %j", data);
      return resolve(data);
    });
  });
}
