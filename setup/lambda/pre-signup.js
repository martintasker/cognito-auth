exports.preSignup = function(event, context, done) {

  // console.log("trigger-source: %s", event.triggerSource);
  // console.log("userName =", event.userName, "userPoolId =", event.userPoolId, "email =", event.request.userAttributes.email);

  var emailWhiteList = [
    'user@example.com'
  ];

  var emailAddress = event.request.userAttributes.email;

  // reject user if not on email whitelist
  if (emailWhiteList.indexOf(emailAddress) < 0) {
    console.log("email address %s not on whitelist", emailAddress);
    done("email address not on whitelist");
  }

  // confirm user, so they can be logged in immediately
  event.response.autoConfirmUser = true;
};
