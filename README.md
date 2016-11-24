# cognito-auth with Angular

Aims:

* implement an Angular `CognitoAuth` service with major cognito authentication functionality,
  based on recipes given in the
  [amazon-cognito-identity-js](https://github.com/aws/amazon-cognito-identity-js) README
* deliver `CognitoAuth` as a ready-to-use library which can be installed in client projects using bower
* deliver a uniformly promised-based API (no callbacks)
* underneath the Angular service, deliver a pure JavaScript API, also promise-based, for use in other
  frameworks, eg React
* implement a setup script which handles all required AWS setup from the command line with minimal parameterization,
  with code also available for copying and tweaking
* implement a demo app using Angular and Boostrap, which gives 100% coverage of `CognitoAuth`,
  whose code is available for copying and tweaking -- but which is not necessarily conveniently
  packaged, and is not necessarily a sane user experience

This provides easy-to-use user management, and yet industrial-strength security.  No developer
credentials are used in client code or seen client-side.  Security is assured by server setup
(AWS's infrastructure, plus sensible configuration in the setup script in this project).

Contents:

* [features](#features)
* [how to use](#how-to-use)
* [background information](#background-information)
* [building](#how-to-build)

## Features

### Done

* registration using name and email address, confirmation with code (optionally re-sendable), de-registration
* admin-initiated registration
* login, session pick-up from local storage on browser refresh, logout
* send forgotten-password code and reset password (after registered)
* change password (while logged in)
* setup script and demo app needed for the above
* bower-installable `CognitoAuth` service
* bucket setup and file upload, to demonstrate/validate that the access controls work
* pure JavaScript layer under Angular service, could be used in other frameworks

### Issues

* pure JavaScript uses ES6 promises without transpilation, reducing browser coverage
* S3 application should be more cleanly separated from Cognito auth basics
* current building and packaging works, but is a bit icky

### Backlog

In no particular order, and with no particular commitments:

* email address as alias for username, so no distinct username needed
* use of phone number as alias, and SMS for sending confirmation code
* user profile management
* proper MFA support
* federated login via Facebook
* other federated login
* multi-device management
* separate out pure JavaScript so it can be used in React without any Angular cruft,
  and transpile it properly so its promises work on more browsers
* React-based demo

### Scope limitations

The demo UI is not a sensible end-user design and is not intended to be.  It's just for
demonstrating and testing the `CognitoAuth` service.

The S3 code is essentially a validation of the Cognito auth infrastructure: it is not
a serious application and does not represent serious application structure.

Cognito Sync isn't included, and isn't naturally within scope of cognito-auth.  But
it is a natural application and it is tempting to try that as a complementary project.

### Recent releases

| release | key features |
| --- | --- |
| v0.6.0, v0.6.1 | split pure-JS code from Angular wrapper |
| v0.5.0 | first release to github |

## How to use

In principle, same as any Angular package delivered via bower:

* install using `bower install --save martintasker/cognito-auth`
* include a reference to the library in your HTML (hopefully your tooling does that for you)
* make your Angular application dependent on `mpt.cognito-auth`
* use the `CognitoAuth` service to manage authentication; inject it as a dependency where needed

Note that the AWS Cognito SDK and AWS Cognito Identity SDK dependencies are brought in with the above
`bower install`: you don't need to include them also in your client project.  This makes your life
easier, because these SDKs are a bit strangely packaged by Amazon.  However, you will need to include
the AWS SDK in your project independently (`bower install aws-sdk`), and you'll need to include some
numerical/crypto dependencies, for which there doesn't appear to be a convenient bower package currently:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/cryptico/0.0.1343522940/jsbn.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/json2/20160511/json2.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/sjcl/1.0.6/sjcl.min.js"></script>
```

Then you'll want to

* [do back-end setup](#back-end-setup)
* [test the back-end setup](#testing-the-back-end-setup) and perhaps [fiddle with it](#fiddling-with-the-back-end-setup)
* optionally [register users using admin scripts](#admin-initiated-registration)
* [use the `CognitoAuth` APIs in your app](#using-cognito-auth-in-your-own-app)

### Back-end setup

cognito-auth requires AWS setup in the back end.  Many tutorials/guides give step-by-step instructions
about setting that up via the AWS console.  cognito-auth provides a setup script to do everything for
you.  In principle, what you do is:

* edit `setup/lib/config.js` to specify the pool names, app name, role names etc that you want
* `cd setup`, then `node setup -p -b (bucket-name)`
  (the `-p` means set up the user pools, the `-b` means set up the named bucket)

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

### Admin-initiated registration

You can register a user using

```shell
node add-user -u username -e email_username@email_host
```

and you can find out what users have been so registered using

```shell
node query
```

Admin-initiated registration causes an email to be sent to the specified address, with an initial password.
You then (attempt to) login in the usual way, with the given username and password.  You are then forced
to enter a different password (in the **Forced Password** form) to complete the login.

### Using cognito-auth in your own app

Once you've tested that the back-end setup works, you'll want to integrate the `CognitoAuth` service into your own app.

Use the demo app as a starting-point, but **do not** just copy and tweak it wholesale:

* use `app/scripts/app.js` to see how to inject the module dependency and configure overall
* use the `CognitoAuth.` API calls in `app/scripts/user/*.component.js` as illustrations of how to
  call the APIs
* **do not** manually inject the individual files from `app/scripts/cognito-auth/*.js` into your
  application: instead, use the built `cognito-auth` library from bower
* **do not** think of the S3-based configuration (using `node setup -b`) or file upload (in the UI and app)
  as anything other than toys.  Real S3-based use needs a better UI, and more careful bucket policies.
* **do not** inflict on your users, the test-style UI of the demo app!

Sensible integration of authentication into app design would include:

* only the login and logout functionality easily visible -- login when logged out, and logout when logged in
* `ui-bootstrap`-driven dialogs for registration, MFA, password and profile changes
* double-entry for passwords to catch typing mistakes
* an interactive password strength checker
* nice integration of login, logout, registration and profile management into the navbar
* conversion of email registration code into click-through address so you can confirm registration by a simple
  click from the email

This project doesn't attempt that, because it's easy to enough to do in Angular if you have the underlying service
and the back-end setup working.  That service and setup are what this project aims to do well.

### Fiddling with back-end setup

If you need to tweak your buckets, pools etc after your initial `node setup`, you have a few options:

* run `node teardown`, tweak `setup/lib/config.js`, and run `node setup` again: it destroys everything, including
  registered users; so it's good during development, but inappropriate once you've switched to production
* tweak things manually through the AWS console pages: this might be easiest during production
* use the `-p` and `-b` flags, on setup and teardown, to only partially set up or tear down
* write your own scripts, tweak `setup` and `teardown` and teardown to taste, etc: that might
  be better than manual tweaks or wholesale teardown.  It's fiddly, and of course you're on your own.  But if it's the
  right thing for you, well, you'll know.

## Background information

The key to everything in this `cognito-auth` project is
[the AWS Cognito Identity SDK for JavaScript](https://github.com/aws/amazon-cognito-identity-js).
The `CognitoAuth` service essentially comprises code adopted and Angularized from the use cases
in that project's `README`:

| use case | description | status |
| --- | --- | --- |
| 1 | registering | done (email only) |
| 2 | confirming using SMS confirmation code | done |
| 3 | resending SMS confirmation code | done |
| 4 | authentication and establishing session | done |
| 5 | user attributes | |
| 6 | verify user attribute | |
| 7 | delete user attribute | |
| 8 | update user attributes | |
| 9 | enabling MFA | |
| 10 | disabling MFA | |
| 11 | changing password for authenticated user | done |
| 12 | starting and completing forgotten-password flow | done |
| 13 | deleting authenticated user | done |
| 14 | signing out | done |
| 15 | global sign-out | |
| 16 | retrieve current user from local storage | done |
| 17 | integrating cognito identity with cognito | |
| 18 | get devices for current user | |
| 19 | get information about the current device | |
| 20 | remember a device | |
| 21 | do not remember a device | |
| 22 | forget the current device | |
| 23 | complete admin-initiated registration and login, by giving auth code and changing password | done |

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
