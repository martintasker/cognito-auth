'use strict';

window.CognitoAuth = function(config, eventCallback) {

  AWS.config.region = config.AWS_REGION;

  var cognitoIDP = 'cognito-idp.' + config.AWS_REGION + '.amazonaws.com/' + config.AWS_USER_POOL_ID;

  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool({
    UserPoolId: config.AWS_USER_POOL_ID,
    ClientId: config.AWS_APP_ID
  });

  var currentUser = null;
  var partialUser = null;

  setInitialCredentials();

  function trace() {
    if (config.TRACE) {
      console.log.apply(null, arguments);
    }
  }

  function setInitialCredentials() {
    trace("CognitoAuth.setInitialCredentials()");
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: config.AWS_ID_POOL_ID,
    });
    var cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      trace("retrieveUser: no user from previous session");
      eventCallback('CognitoAuth.loggedOut');
      return;
    }
    cognitoUser.getSession(function(err, session) {
      if (err || !session.isValid()) {
        if (err) {
          trace("retrieveUser: getSession error", err);
        } else {
          trace("retrieveUser: previous session is not valid");
        }
        eventCallback('CognitoAuth.loggedOut');
        return;
      }
      trace("getSession: session", session);
      var logins = {};
      logins[cognitoIDP] = session.getIdToken().getJwtToken();
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: config.AWS_ID_POOL_ID,
        Logins: logins
      });
      currentUser = cognitoUser;
      trace("AWS.config.credentials constructed", AWS.config.credentials);
      eventCallback('CognitoAuth.loggedIn');
    });
  }

  function setDefaultCredentials() {
    trace("CognitoAuth.setDefaultCredentials()");
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: config.AWS_ID_POOL_ID,
    });
    eventCallback('CognitoAuth.loggedOut');
  }

  function register(username, password, emailAddress, phoneNumber) {
    trace("CognitoAuth.register() --", username, '(password)', emailAddress, phoneNumber);
    return new Promise(function(resolve, reject) {
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
          reject(err);
          return;
        }
        var cognitoUser = res.user;
        resolve(cognitoUser);
        trace("success");
      });
    });
  }

  function resendConfirmationCode(username) {
    trace("CognitoAuth.resendConfirmationCode() --", username);
    return new Promise(function(resolve, reject) {
      var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
        Username: username,
        Pool: userPool
      });
      cognitoUser.resendConfirmationCode(function(err, res) {
        if (err) {
          console.log("cognitoUser.resendConfirmationCode() error:", err);
          reject(err);
          return;
        }
        resolve();
        trace("success");
      });
    });
  }

  function confirmRegistration(username, code) {
    trace("CognitoAuth.confirmRegistration() --", username, code);
    return new Promise(function(resolve, reject) {
      var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
        Username: username,
        Pool: userPool
      });
      cognitoUser.confirmRegistration(code, true, function(err, res) {
        if (err) {
          console.log("cognitoUser.confirmRegistration() error:", err);
          reject(err);
          return;
        }
        resolve();
        trace("success");
      });
    });
  }

  function login(username, password) {
    trace("CognitoAuth.login() --", username, '(password)');
    if (username) {
      partialUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
        Username: username,
        Pool: userPool
      });
    }

    return Promise.resolve()
      .then(doLogin)
      .then(getCredentials)
      .then(function() {
        currentUser = partialUser;
        partialUser = null;
        trace("authenticate: overall success");
        eventCallback('CognitoAuth.loggedIn');
      })
      .catch(function(reason) {
        var oldCurrentUser = currentUser;
        currentUser = null;
        if (oldCurrentUser) {
          eventCallback('CognitoAuth.loggedOut');
        }
        throw reason;
      });

    function doLogin() {
      trace("CognitoAuth.login() -- doLogin() --", username, '(password)');
      return new Promise(function(resolve, reject) {
        if (username) {
          partialUser.authenticateUser(new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails({
            Username: username,
            Password: password,
          }), getAuthCallbacks(resolve, reject));
        } else {
          partialUser.completeNewPasswordChallenge(password, {}, getAuthCallbacks(resolve, reject));
        }
      });
    }

    function getAuthCallbacks(resolve, reject) {
      return {
        onFailure: function(err) {
          console.log("cognitoUser.authenticateUser() error:", err);
          reject(err);
        },
        onSuccess: function(res) {
          trace("cognitoUser.authenticate/complete-challenge result:", res);
          var logins = {};
          logins[cognitoIDP] = res.getIdToken().getJwtToken();
          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: config.AWS_ID_POOL_ID,
            Logins: logins
          });
          trace("login: success");
          resolve(partialUser);
        },
        newPasswordRequired: function(attribsGiven, attribsRequired) {
          trace("authenticate: newPasswordRequired, attribsGiven:", attribsGiven, "attribsRequired:", attribsRequired);
          eventCallback('CognitoAuth.newPasswordRequired', {
            attribsGiven: attribsGiven,
            attribsRequired: attribsRequired
          });
          reject('new password required');
        }
      }
    }

    // todo: check when it's necessary to do this
    function getCredentials() {
      return new Promise(function(resolve, reject) {
        if (true) {
          resolve(partialUser);
          return;
        }
        trace("CognitoAuth.login() -- getCredentials()", AWS.config.credentials);
        AWS.config.credentials.get(function(err) {
          if (err) {
            console.log("error:", err);
            reject(err);
            setDefaultCredentials();
            return;
          }
          trace("getCredentials: success", AWS.config.credentials);
          resolve(partialUser);
        });
      });
    }
  }

  function logout() {
    trace("CognitoAuth.logout()");
    return new Promise(function(resolve, reject) {
      if (!currentUser) {
        reject("no current user: cannot logout");
        return;
      }
      currentUser.signOut();
      currentUser = null;
      setDefaultCredentials();
      resolve();
      trace("success");
    });
  }

  function deregister() {
    trace("CognitoAuth.deregister()");
    return new Promise(function(resolve, reject) {
      if (!currentUser) {
        reject("no current user: cannot deregister");
        return;
      }
      currentUser.deleteUser(function(err) {
        if (err) {
          console.log("cognitoUser.deleteUser() error:", err);
          reject(err);
          return;
        }
        currentUser.clearCachedTokens(); // really AWS should handle this in the SDK
        currentUser = null;
        trace("deregister: success");
        setDefaultCredentials();
        resolve();
      });
    });
  }

  function changePassword(oldPassword, password) {
    trace("CognitoAuth.changePassword() --", '(oldPassword)', '(password)');
    return new Promise(function(resolve, reject) {
      currentUser.changePassword(oldPassword, password, function(err) {
        if (err) {
          console.log("cognitoUser.changePassword() error:", err);
          reject(err);
          return;
        }
        trace("changePassword: success");
        resolve();
      });
    });
  }

  function requestNewPasswordCode(username) {
    trace("CognitoAuth.requestNewPasswordCode() --", username);
    return new Promise(function(resolve, reject) {
      var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
        Username: username,
        Pool: userPool
      });
      cognitoUser.forgotPassword({
        onSuccess: function() {
          trace("success");
          resolve();
        },
        onFailure: function(err) {
          console.log("cognitoUser.forgotPassword() error:", err);
          reject(err);
        },
      });
    });
  }

  function setPasswordWithCode(username, password, code) {
    trace("CognitoAuth.setPasswordWithCode() --", username, '(password)', code);
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
      Username: username,
      Pool: userPool
    });
    return new Promise(function(resolve, reject) {
      cognitoUser.confirmPassword(code, password, {
        onSuccess: function() {
          trace("success");
          resolve();
        },
        onFailure: function(err) {
          console.log("cognitoUser.confirmPassword() error:", err);
          reject(err);
        },
      });
    });
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

}
