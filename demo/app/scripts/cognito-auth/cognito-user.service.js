'use strict';

/* globals AWS */
/* globals AWSCognito */

angular.module('mpt.cognito-auth')

.factory('CognitoUser', function($q, $rootScope, CognitoAuthConfig) {

  /*
    You must define:
    AWS_REGION: as usual
    AWS_USER_POOL_ID: needs email as alias
    AWS_APP_ID: _without_ client secret, in above pool
    AWS_ID_POOL_ID: using above pool and app id, not allowing unauthenticated access
  */

  AWS.config.region = CognitoAuthConfig.AWS_REGION;

  var cognitoIDP = 'cognito-idp.' + CognitoAuthConfig.AWS_REGION + '.amazonaws.com/' + CognitoAuthConfig.AWS_USER_POOL_ID;

  var currentUser = null;
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool({
    UserPoolId: CognitoAuthConfig.AWS_USER_POOL_ID,
    ClientId: CognitoAuthConfig.AWS_APP_ID
  });
  setInitialCredentials();

  function setInitialCredentials() {
    var trace = true;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: CognitoAuthConfig.AWS_ID_POOL_ID,
    });
    var cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      trace && console.log("retrieveUser: no user from previous session");
      $rootScope.$broadcast('CognitoUser.loggedOut');
      return;
    }
    cognitoUser.getSession(function(err, session) {
      if (err || !session.isValid()) {
        trace && err && console.log("retrieveUser: getSession error", err);
        trace && !err && console.log("retrieveUser: previous session is not valid");
        $rootScope.$broadcast('CognitoUser.loggedOut');
        return;
      }
      var logins = {};
      logins[cognitoIDP] = session.getIdToken().getJwtToken();
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: CognitoAuthConfig.AWS_ID_POOL_ID,
        Logins: logins
      });
      currentUser = cognitoUser;
      $rootScope.$broadcast('CognitoUser.loggedIn');
    });
  }

  function setDefaultCredentials() {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: CognitoAuthConfig.AWS_ID_POOL_ID,
    });
    $rootScope.$broadcast('CognitoUser.loggedOut');
  }

  function register(username, password, emailAddress, phoneNumber) {
    var result = $q.defer();
    var attributeList = [];
    if (emailAddress) {
      attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
        Name: 'email',
        Value: emailAddress
      }));
    }
    if (phoneNumber) {
      attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
        Name: 'phone_number',
        Value: phoneNumber
      }));
    }
    userPool.signUp(username, password, attributeList, null, function(err, res) {
      if (err) {
        console.log("UserPool.signup() error:", err);
        result.reject(err);
        return;
      }
      var cognitoUser = res.user;
      result.resolve(cognitoUser);
    });
    return result.promise;
  }

  function login(username, password) {
    var result = $q.defer();
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
      Username: username,
      Pool: userPool
    });
    cognitoUser.authenticateUser(new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails({
      Username: username,
      Password: password,
    }), {
      onFailure: function(err) {
        console.log("cognitoUser.authenticateUser() error:", err);
        result.reject(err);
      },
      onSuccess: function(res) {
        var logins = {};
        logins[cognitoIDP] = res.getIdToken().getJwtToken();
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: CognitoAuthConfig.AWS_ID_POOL_ID,
          Logins: logins
        });
        AWS.config.credentials.get(function(err) {
          if (err) {
            console.log("error:", err);
            result.reject(err);
            setDefaultCredentials();
            return;
          }
          currentUser = cognitoUser;
          $rootScope.$broadcast('CognitoUser.loggedIn');
          result.resolve(cognitoUser);
        });
      },
    });
    return result.promise;
  }

  function logout() {
    var result = $q.defer();
    if (!currentUser) {
      result.reject("no current user: cannot logout");
      return result.promise;
    }
    currentUser.signOut();
    currentUser = null;
    setDefaultCredentials();
    result.resolve();
    return result.promise;
  }

  function deregister() {
    var result = $q.defer();
    if (!currentUser) {
      result.reject("no current user: cannot deregister");
      return result.promise;
    }
    currentUser.deleteUser(function(err) {
      if (err) {
        console.log("cognitoUser.deleteUser() error:", err);
        result.reject(err);
        return;
      }
      result.resolve();
      currentUser = null;
    });
    return result.promise;
  }

  function current() {
    return currentUser;
  }

  function isLoggedIn() {
    return !!currentUser;
  }

  // public interface
  return {
    register: register, // username, password, emailAddress, phoneNumber -> promise of cognitoUser
    login: login, // username, password -> promise of cognitoUser
    logout: logout, // -> promise
    deregister: deregister, // -> promise
    current: current, // -> cognitoUser or null
    isLoggedIn: isLoggedIn, // -> true/false
    // message broadcast to root: 'CognitoUser.loggedIn'
    // message broadcast to root: 'CognitoUser.loggedOut'
  };

})

;