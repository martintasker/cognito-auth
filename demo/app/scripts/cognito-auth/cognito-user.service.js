'use strict';

/* globals AWS */
/* globals AWSCognito */

angular.module('mpt.cognito-auth')

.factory('CognitoUser', function($q, $rootScope, CognitoAuthConfig) {

  AWS.config.region = CognitoAuthConfig.AWS_REGION;

  var cognitoIDP = 'cognito-idp.' + CognitoAuthConfig.AWS_REGION + '.amazonaws.com/' + CognitoAuthConfig.AWS_USER_POOL_ID;

  var currentUser = null;
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool({
    UserPoolId: CognitoAuthConfig.AWS_USER_POOL_ID,
    ClientId: CognitoAuthConfig.AWS_APP_ID
  });
  setInitialCredentials();

  function trace() {
    if (CognitoAuthConfig.TRACE) {
      console.log.apply(null, arguments);
    }
  }

  function setInitialCredentials() {
    trace("CognitoUser.setInitialCredentials()");
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: CognitoAuthConfig.AWS_ID_POOL_ID,
    });
    var cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      trace("retrieveUser: no user from previous session");
      $rootScope.$broadcast('CognitoUser.loggedOut');
      return;
    }
    cognitoUser.getSession(function(err, session) {
      if (err || !session.isValid()) {
        if (err) {
          trace("retrieveUser: getSession error", err);
        } else {
          trace("retrieveUser: previous session is not valid");
        }
        $rootScope.$broadcast('CognitoUser.loggedOut');
        return;
      }
      trace("getSession: session", session);
      var logins = {};
      logins[cognitoIDP] = session.getIdToken().getJwtToken();
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: CognitoAuthConfig.AWS_ID_POOL_ID,
        Logins: logins
      });
      currentUser = cognitoUser;
      trace("AWS.config.credentials constructed", AWS.config.credentials);
      $rootScope.$broadcast('CognitoUser.loggedIn');
    });
  }

  function setDefaultCredentials() {
    trace("CognitoUser.setDefaultCredentials()");
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: CognitoAuthConfig.AWS_ID_POOL_ID,
    });
    $rootScope.$broadcast('CognitoUser.loggedOut');
  }

  function register(username, password, emailAddress, phoneNumber) {
    trace("CognitoUser.register() --", username, '(password)', emailAddress, phoneNumber);
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
      trace("success");
      result.resolve(cognitoUser);
    });
    return result.promise;
  }

  function resendConfirmationCode(username) {
    trace("CognitoUser.resendConfirmationCode() --", username);
    var result = $q.defer();
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
      Username: username,
      Pool: userPool
    });
    cognitoUser.resendConfirmationCode(function(err, res) {
      if (err) {
        console.log("cognitoUser.resendConfirmationCode() error:", err);
        result.reject(err);
        return;
      }
      result.resolve();
    });
    return result.promise;
  }

  function confirmRegistration(username, code) {
    trace("CognitoUser.confirmRegistration() --", username, code);
    var result = $q.defer();
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
      Username: username,
      Pool: userPool
    });
    cognitoUser.confirmRegistration(code, true, function(err, res) {
      if (err) {
        console.log("cognitoUser.confirmRegistration() error:", err);
        result.reject(err);
        return;
      }
      result.resolve();
    });
    trace("success");
    return result.promise;
  }

  function login(username, password) {
    trace("CognitoUser.login() --", username, '(password)');
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
      Username: username,
      Pool: userPool
    });

    var result = $q.defer();
    result.resolve();
    return result.promise
      .then(function() {
        return doLogin();
      })
      .then(function() {
        return getCredentials();
      })
      .then(function() {
        currentUser = cognitoUser;
        trace("login: overall success");
        $rootScope.$broadcast('CognitoUser.loggedIn');
      });

    function doLogin() {
      trace("CognitoUser.login() -- doLogin() --", username, '(password)');
      var result = $q.defer();
      cognitoUser.authenticateUser(new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails({
        Username: username,
        Password: password,
      }), {
        onFailure: function(err) {
          console.log("cognitoUser.authenticateUser() error:", err);
          result.reject(err);
        },
        onSuccess: function(res) {
          trace("cognitoUser.authenticateUser() result:", res);
          var logins = {};
          logins[cognitoIDP] = res.getIdToken().getJwtToken();
          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: CognitoAuthConfig.AWS_ID_POOL_ID,
            Logins: logins
          });
          trace("doLogin: success");
          result.resolve(cognitoUser);
        },
      });
      return result.promise;
    }

    function getCredentials() {
      trace("CognitoUser.login() -- getCredentials()");
      var result = $q.defer();
      AWS.config.credentials.get(function(err) {
        if (err) {
          console.log("error:", err);
          result.reject(err);
          setDefaultCredentials();
          return;
        }
        trace("getCredentials: success", AWS.config.credentials);
        result.resolve(cognitoUser);
      });
      return result.promise;
    }
  }

  function logout() {
    trace("CognitoUser.logout()");
    var result = $q.defer();
    if (!currentUser) {
      result.reject("no current user: cannot logout");
      return result.promise;
    }
    currentUser.signOut();
    currentUser = null;
    setDefaultCredentials();
    result.resolve();
    trace("success");
    return result.promise;
  }

  function deregister() {
    trace("CognitoUser.deregister()");
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
      currentUser.clearCachedTokens(); // really AWS should handle this in the SDK
      currentUser = null;
      trace("deregister: success");
      setDefaultCredentials();
      result.resolve();
    });
    return result.promise;
  }

  function requestNewPasswordCode(username) {
    trace("CognitoUser.requestNewPasswordCode() --", username);
    var result = $q.defer();
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
      Username: username,
      Pool: userPool
    });
    cognitoUser.forgotPassword({
      onSuccess: function() {
        trace("success");
        result.resolve();
      },
      onFailure: function(err) {
        console.log("cognitoUser.forgotPassword() error:", err);
        result.reject(err);
      },
    });
    return result.promise;
  }

  function setPasswordWithCode(username, password, code) {
    trace("CognitoUser.setPasswordWithCode() --", username, '(password)', code);
    var result = $q.defer();
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
      Username: username,
      Pool: userPool
    });
    cognitoUser.confirmPassword(code, password, {
      onSuccess: function() {
        trace("success");
        result.resolve();
      },
      onFailure: function(err) {
        console.log("cognitoUser.confirmPassword() error:", err);
        result.reject(err);
      },
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
    confirmRegistration: confirmRegistration, // username, code -> promise
    resendConfirmationCode: resendConfirmationCode, // username -> promise
    login: login, // username, password -> promise of cognitoUser
    logout: logout, // -> promise
    deregister: deregister, // -> promise
    requestNewPasswordCode: requestNewPasswordCode, // username -> promise
    setPasswordWithCode: setPasswordWithCode, // username, password, code -> promise
    current: current, // -> cognitoUser or null
    isLoggedIn: isLoggedIn, // -> true/false
    // message broadcast to root: 'CognitoUser.loggedIn'
    // message broadcast to root: 'CognitoUser.loggedOut'
  };

})

;
