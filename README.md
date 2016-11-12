# cognito-auth with Angular

Aims:

* implement Angular-based `CognitoAuth` service with major cognito authentication functionality,
  based on Angularization of recipes given in the
  [amazon-cognito-identity-js](https://github.com/aws/amazon-cognito-identity-js) README
* use a uniformly promise-based API to the Angular service (no callbacks)
* deliver `CognitoAuth` as a ready-to-use library which can be installed in client projects using bower
* implement a setup script which handles all required AWS setup from the command line with minimal parameterization,
  with code also available for copying and tweaking
* implement a demo app using Angular and Boostrap, which gives 100% coverage of `CognitoAuth`,
  whose code is available for copying and tweaking -- but which is not necessarily conveniently
  packaged, and is not necessarily a sane user experience

This provides easy-to-use user management, and yet industrial-strength security.  No developer
credentials are used in client code or seen client-side.  Security is assured by server setup
(AWS's infrastructure, plus sensible configuration in the setup script in this project).

This is a long document: skip quickly to [using](#how-to-use), [features](#features),
[background information](#background-information), [building](#how-to-build).

## How to use

In principle, same as any Angular package delivered via bower:

* install using `bower install --save martintasker/cognito-auth`
* include a reference to the library in your HTML (hopefully your tooling does that for you)
* make your Angular application dependent on `mpt.cognito-auth`
* use the `CognitoAuth` service to manage authentication; inject it as a dependency where needed

Note that the AWS Cognito SDK and AWS Cognito Identity SDK dependencies are brought in with the above
`bower install`: you don't need to include them also in your client project.  This makes your life
easier, because these SDKs are a bit strangely packaged by Amazon.  However, you will need to include
the AWS SDK in your project independently (`bower install aws-sdk`).

Now you'll need to do back-end setup, and to use the `CognitoAuth` APIs in your app.

### Back-end setup

cognito-auth requires AWS setup in the back end.  Many tutorials/guides give step-by-step instructions
about setting that up via the AWS console.  cognito-auth provides a setup script to do everything for
you.  In principle, what you do is:

* edit `setup/lib/config.js` to specify the pool names, app name, role names etc that you want
* also edit the bucket name: you **must** change it (or not set up buckets at all)
* `cd setup`, then `node setup`

The `node setup` script assumes your admin/developer AWS credentials are available, eg from a previous `aws config` command
on the CLI.

The whole point of Cognito is that no developer credentials need to leak to the public.  Your users only see the pool IDs
etc allocated during setup -- which are now in `setup/settings.json`.  Open that file in an editor, and paste the settings
object (or at least the properties which you need) into the following snippet in your app:

```js
'use strict';

// paste into the below from setup/settings.json
var settings = {
  "userPoolId": "eu-west-1_XXXXXXXXX",
  "applicationId": "xxxxxxxxxxxxxxxxxxxxxxxxx",
  "identityPoolId": "eu-west-1:00000000-0000-0000-0000-000000000000",
  "bucketName": "xxx.xxx.xxx.com",
};

angular.module('yourApp')

.constant('CognitoAuthConfig', {
  AWS_REGION: 'eu-west-1',
  AWS_USER_POOL_ID: settings.userPoolId,
  AWS_APP_ID: settings.applicationId,
  AWS_ID_POOL_ID: settings.identityPoolId,
  TRACE: false,
})

.constant('CognitoAuthS3Config', {
  BUCKET_REGION: 'eu-west-1',
  BUCKET_NAME: settings.bucketName,
  TRACE: true,
})

;
```

If you like, you can paste the values directly into the relevant `.constant`.  But, probably, you'll find yourself
repeatedly setting up and tearing down during development.  If so, you'll probably find it easier to use the structure
suggested above: you can just paste directly into the `settings` object without any fiddly field-by-field editing.

### Testing the back-end setup

The demo app allows you to test the setup created by `node setup`:

* edit `demo/app/scripts/app.js` and paste the settings from `setup/settings.js` into it, as shown above
* run the app: `cd demo`, then `grunt serve`
* press F12 to bring up a browser debug console
* do **Register** with your username, email address and password
* wait for the confirmation code to come to your email address, then do **Confirm** with your username and code
* **Login** using your username and password
* **Choose File** and upload it

If you got that far, then back-end setup worked ok and you know how to configure an app to connect to the back-end.
You can **Logout**, **Deregister**, go through the cycle a few more times, just to make sure.

If there are problems, you'll need to troubleshoot.  In the demo app, the `TRACE` option is set to true, which gives
a verbose console log, which helps.  Do double-check that you pasted the settings from your latest run of `node setup`
into your app.

### Using cognito-auth in your own app

Once you've tested that the back-end setup works, you'll want to integrate the `CognitoAuth` service into your own app.

Use the demo app as a starting-point, but **do not** just copy and tweak it wholesale:

* use `app/scripts/app.js` to see how to inject the module dependency and configure overall
* use the `CognitoUser.` API calls in `app/scripts/user/*.component.js` as illustrations of how to
  call the APIs
* **do not** manually inject the individual files from `app/scripts/cognito-auth/*.js` into your
  application: instead, use the built `cognito-auth` library from bower
* **do not** think of the S3-based configuration (in `node setup`) or file upload (in the UI and app)
  as anything other than toys.  Real S3-based use needs a better UI, and more careful bucket policies.
* **do not** inflict on your users, the test-style UI of the demo app!  Integrate things properly
  into a nice UI design, maybe using `ui-bootstrap` for dialogs or such.

### Fiddling with back-end setup

If you need to tweak your buckets, pools etc after your initial `node setup`, you have a few options:

* run `node teardown`, tweak `setup/lib/config.js`, and run `node setup` again: it destroys everything, including
  registered users; so it's good during development, but inappropriate once you've switched to production
* tweak things manually through the AWS console pages: this might be easiest during production
* you could write your own scripts, use use `setup` and `teardown` phases tweaked via the `config` option: that might
  be better than manual tweaks or wholesale teardown.  It's fiddly, and of course you're on your own.  But if it's the
  right thing for you, well, you'll know.

## Features

### Done

* registration using name and email address, confirmation with code (optionally re-sendable), de-registration
* login, session pick-up from local storage on browser refresh, logout
* send forgotten-password code and reset password (after registered)
* setup script and demo app needed for the above
* bower-installable `CognitoAuth` service
* bucket setup and file upload, to demonstrate/validate that the access controls work

### Issues

* S3 application should be more cleanly separated from Cognito auth basics
* current building and packaging works, but is a bit icky

### Backlog

In no particular order, and with no particular commitments:

* email address as alias for username, so no distinct username needed
* use of phone number as alias, and SMS for sending confirmation code
* admin-initiated registration
* change password
* user profile management
* proper MFA support
* federated login via Facebook
* other federated login
* multi-device management

### Scope limitations

The S3 code is essentially a validation of the Cognito auth infrastructure: it is not
a serious application and does not represent serious application structure.

Cognito Sync isn't included, and isn't naturally within scope of cognito-auth.  But
it is a natural application and it is tempting to try that as a complementary project.

## Background information

The key to everything in this `cognito-auth` project is
[the AWS Cognito Identity SDK for JavaScript](https://github.com/aws/amazon-cognito-identity-js).
The `CognitoAuth` service essentially comprises code adopted and Angularized from the use cases
in that project's `README`:

* 1, registering -- done (email only)
* 2, confirming using SMS confirmation code -- done
* 3, resending SMS confirmation code -- done
* 4, authentication and establishing session -- done
* 5, user attributes
* 6, verify user attribute
* 7, delete user attribute
* 8, update user attributes
* 9, enabling MFA
* 10, disabling MFA
* 11, changing password for authenticated user
* 12, starting and completing forgotten-password flow -- done
* 13, deleting authenticated user -- done
* 14, signing out -- done
* 15, global sign-out
* 16, retrieve current user from local storage -- done
* 17, integrating cognito identity with cognito
* 18, get devices for current user
* 19, get information about the current device
* 20, remember a device
* 21, do not remember a device
* 22, forget the current device
* 23, complete admin-initiated registration and login, by giving auth code and changing password

Useful additional pointers:

* [getting started with Cognito](http://aws.amazon.com/developers/getting-started/browser/).
* [Lambda in action](https://github.com/danilop/AWS_Lambda_in_Action/tree/master/Chapter10/SampleAuth/fn/sampleAuthCreateUser) (danilop)
* [Building Serverless Apps with AWS Lambda](https://auth0.com/blog/building-serverless-apps-with-aws-lambda/) (auth0)
* [Authentication with Amazon Cognito in the Browser](https://blogs.aws.amazon.com/javascript/post/Tx1F7FO6GDAIXD3/Authentication-with-Amazon-Cognito-in-the-Browser)
* [configuring the SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/browser-configuring.html)
* [using WebPack with Amazon Cognito Identity SDK for JavaScript](https://aws.amazon.com/blogs/mobile/using-webpack-with-the-amazon-cognito-identity-sdk-for-javascript/)

## How to build

The `CognitoAuth` service is developed in-place in the context of the demo app.

In effect, the demo app is the unit test suite for the `CognitoAuth` service: it's not trivial to
unit test an authentication service in the conventional way
(confirmation codes and MFA, for example, rely on different communication channels).

To build for release,

* use `npm run build` from the command line -- this simply runs `webpack`
* commit, tag and push
* have your clients update their dependency to bring in the appropriate tag
