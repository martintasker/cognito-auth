'use strict';

/* globals AWS */
/* globals AWSCognito */

angular.module('mpt.cognito-auth')

.factory('CognitoAuth', function($q, $rootScope, CognitoAuthConfig) {

  AWS.config.region = CognitoAuthConfig.AWS_REGION;

  var cognitoIDP = 'cognito-idp.' + CognitoAuthConfig.AWS_REGION + '.amazonaws.com/' + CognitoAuthConfig.AWS_USER_POOL_ID;

  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool({
    UserPoolId: CognitoAuthConfig.AWS_USER_POOL_ID,
    ClientId: CognitoAuthConfig.AWS_APP_ID
  });

  var currentUser = null;
  var partialUser = null;

  setInitialCredentials();

  function trace() {
    if (CognitoAuthConfig.TRACE) {
      console.log.apply(null, arguments);
    }
  }

  function setInitialCredentials() {
    trace("CognitoAuth.setInitialCredentials()");
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: CognitoAuthConfig.AWS_ID_POOL_ID,
    });
    var cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      trace("retrieveUser: no user from previous session");
      $rootScope.$broadcast('CognitoAuth.loggedOut');
      return;
    }
    cognitoUser.getSession(function(err, session) {
      if (err || !session.isValid()) {
        if (err) {
          trace("retrieveUser: getSession error", err);
        } else {
          trace("retrieveUser: previous session is not valid");
        }
        $rootScope.$broadcast('CognitoAuth.loggedOut');
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
      $rootScope.$broadcast('CognitoAuth.loggedIn');
    });
  }

  function setDefaultCredentials() {
    trace("CognitoAuth.setDefaultCredentials()");
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: CognitoAuthConfig.AWS_ID_POOL_ID,
    });
    $rootScope.$broadcast('CognitoAuth.loggedOut');
  }

  function register(username, password, emailAddress, phoneNumber) {
    trace("CognitoAuth.register() --", username, '(password)', emailAddress, phoneNumber);
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
    trace("CognitoAuth.resendConfirmationCode() --", username);
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
    trace("CognitoAuth.confirmRegistration() --", username, code);
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
    trace("CognitoAuth.login() --", username, '(password)');
    if (username) {
      partialUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
        Username: username,
        Pool: userPool
      });
    }

    var result = $q.defer();
    result.resolve();
    return result.promise
      .then(doLogin)
      .then(getCredentials)
      .then(function() {
        currentUser = partialUser;
        partialUser = null;
        trace("authenticate: overall success");
        $rootScope.$broadcast('CognitoAuth.loggedIn');
      })
      .catch(function(reason) {
        var oldCurrentUser = currentUser;
        currentUser = null;
        if (oldCurrentUser) {
          $rootScope.$broadcast('CognitoAuth.loggedOut');
        }
        throw reason;
      });

    function doLogin() {
      trace("CognitoAuth.login() -- doLogin() --", username, '(password)');
      var result = $q.defer();
      if (username) {
        partialUser.authenticateUser(new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails({
          Username: username,
          Password: password,
        }), getAuthCallbacks(result));
      } else {
        partialUser.completeNewPasswordChallenge(password, {}, getAuthCallbacks(result));
      }
      return result.promise;
    }

    function getAuthCallbacks(result) {
      return {
        onFailure: function(err) {
          console.log("cognitoUser.authenticateUser() error:", err);
          result.reject(err);
        },
        onSuccess: function(res) {
          trace("cognitoUser.authenticate/complete-challenge result:", res);
          var logins = {};
          logins[cognitoIDP] = res.getIdToken().getJwtToken();
          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: CognitoAuthConfig.AWS_ID_POOL_ID,
            Logins: logins
          });
          trace("login: success");
          result.resolve(partialUser);
        },
        newPasswordRequired: function(attribsGiven, attribsRequired) {
          trace("authenticate: newPasswordRequired, attribsGiven:", attribsGiven, "attribsRequired:", attribsRequired);
          $rootScope.$broadcast('CognitoAuth.newPasswordRequired', {
            attribsGiven: attribsGiven,
            attribsRequired: attribsRequired
          });
          result.reject('new password required');
        }
      }
    }

    // todo: check when it's necessary to do this
    function getCredentials() {
      var result = $q.defer();
      if (true) {
        result.resolve(partialUser);
        return result.promise;
      }
      trace("CognitoAuth.login() -- getCredentials()", AWS.config.credentials);
      AWS.config.credentials.get(function(err) {
        if (err) {
          console.log("error:", err);
          result.reject(err);
          setDefaultCredentials();
          return;
        }
        trace("getCredentials: success", AWS.config.credentials);
        result.resolve(partialUser);
      });
      return result.promise;
    }
  }

  function logout() {
    trace("CognitoAuth.logout()");
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
    trace("CognitoAuth.deregister()");
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

  function changePassword(oldPassword, password) {
    trace("CognitoAuth.changePassword() --", '(oldPassword)', '(password)');
    var result = $q.defer();
    currentUser.changePassword(oldPassword, password, function(err) {
      if (err) {
        console.log("cognitoUser.changePassword() error:", err);
        result.reject(err);
        return;
      }
      trace("changePassword: success");
      result.resolve();
    });
    return result.promise;
  }

  function requestNewPasswordCode(username) {
    trace("CognitoAuth.requestNewPasswordCode() --", username);
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
    trace("CognitoAuth.setPasswordWithCode() --", username, '(password)', code);
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
    changePassword: changePassword, // oldPassword, password -> promise
    requestNewPasswordCode: requestNewPasswordCode, // username -> promise
    setPasswordWithCode: setPasswordWithCode, // username, password, code -> promise
    current: current, // -> cognitoUser or null
    isLoggedIn: isLoggedIn, // -> true/false
    // message broadcast to root: 'CognitoAuth.loggedIn'
    // message broadcast to root: 'CognitoAuth.loggedOut'
    // message broadcast to root: 'CognitoAuth.newPasswordRequired', {attribsGiven, attribsRequired}
  };

})

;
