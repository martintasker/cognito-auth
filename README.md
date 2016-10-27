# cognito-auth with Angular

Aims:

* implement Angular-based `CognitoAuth` service with major cognito authentication functionality,
  based on Angularization of recipes given in the
  [amazon-cognito-identity-js](https://github.com/aws/amazon-cognito-identity-js) README
* deliver `CognitoAuth` as a ready-to-use library which can be installed in client projects using bower
* implement a demo app using Angular, Boostrap and ui-bootstrap, which gives 100% coverage of `CognitoAuth`,
  whose code is available for copying and tweaking (but is not necessarily conveniently packaged)
* implement a setup script which handles all required AWS setup from the command line with minimal parameterization,
  with code also available for copying and tweaking

| directory | purpose |
| --- | --- |
| `demo/` | angular app, including source code for `CognitoAuth`; `bower.json` in here is for the app's role as client of other projects eg Angular etc |
| `dist/` | build output directory for `cognito-auth.js`, available for bower installation |
| `setup/` | contains customizable setup script |
| `./` | `package.json` for build files such as `webpack.config.js` for whole project, and `bower.json` for client use of `cognito-auth.js` |

## To do

Initial minimal functionality:

* bring in ui-bootstrap and bring up app to required functionality
* implement minimal AWS user lifecycle
* implement minimal FB user lifecycle
* have setup script support the above

Later: implement post-minimal functionality.

## Levels of functionality

### Minimal Cognito user lifecycle

Implement user registration and de-registration, login, logout, and recovery of previous session.

To keep it minimal,

* do not include password lifecycle management or user profile data management
* therefore, restrict registration only to pre-permitted account name(s)

This is useful in very tightly-controlled sites with a couple of users known personally to the developer.

This uses use cases 1 (register), 13 (delete), 4 (login), 14 (logout), 15 (global logout), 16 (retrieve previous session),
from the Cognito SDK page.

### Minimal Facebook user lifecycle

Implement federated login using Facebook.

This permits scaling up of access without going through the complexities of proper ID lifecycle management.

### Enable broad Cognito-based user community

The numbers below refer to use cases with the Cognito Identity SDK readme:

* admin-initiated registration 23: this is a simple add to minimal Cognito user lifecycle, enabling the site
  developer/admin to invite users personally, but not scaling beyond a tight user community
* password management: change 11, manage forgotten 12: the absolute minimum necessary to broaden user base
* minimal MFA additionals: confirm code 2, re-send code 3: minimum necessary to sanely broaden user base
* profile management: view 5, verify 6, delete 7, update 8: change email address etc: with this, you have reasonable
  support for a broad Cognito-managed user base
* MFA management: enable 9, disable 10: allows users to change their MFA options.  It's perfectly fine not to permit
  this--just have a site-wide policy that MFA is either required, or not required.

## Demo app

Use

* `grunt` for building
* `grunt serve` for preview
* `grunt build` to build into `dist/` (this is actually `demo/dist/`, so doesn't clash with root-level `npm run build`)

## Technical information

### AWS Cognito

The key to everything in this `cognito-auth` project is the AWS Cognito Identity SDK.
The following use cases are described in that project's `README`, and code is given there
which is copied and Angularized in the `CognitoAuth` service:

* 1, registering
* 2, confirming using SMS confirmation code
* 3, resending SMS confirmation code
* 4, authentication and establishing session
* 5, user attributes
* 6, verify user attribute
* 7, delete user attribute
* 8, update user attributes
* 9, enabling MFA
* 10, disabling MFA
* 11, changing password for authenticated user
* 12, starting and completing forgotten-password flow
* 13, deleting authenticated user
* 14, signing out
* 15, global sign-out
* 16, retrieve current user from local storage
* 17, integrating cognito identity with cognito
* 18, get devices for current user
* 19, get information about the current device
* 20, remember a device
* 21, do not remember a device
* 22, forget the current device
* 23, complete admin-initiated registration and login, by giving auth code and changing password

Or, put another way:

* minimal lifecycle: register 1, login 4, logout 14, 15, delete 13, retrieve session 16
* admin-initiated registration 23
* minimal MFA additionals: confirm code 2, re-send code 3
* password management: change 11, manage forgotten 12
* profile management: view 5, verify 6, delete 7, update 8
* MFA management: enable 9, disable 10
* cognito data-sharing use cases: 17, 18, 19, 20, 21, 22 -- these aren't really to do with
  authentication direction and so would never be in the scope of the `CognitoAuth` service

Useful additional pointers:

* [getting started with Cognito](http://aws.amazon.com/developers/getting-started/browser/).
* [Lambda in action](https://github.com/danilop/AWS_Lambda_in_Action/tree/master/Chapter10/SampleAuth/fn/sampleAuthCreateUser) (danilop)
* [Building Serverless Apps with AWS Lambda](https://auth0.com/blog/building-serverless-apps-with-aws-lambda/) (auth0)
* [Authentication with Amazon Cognito in the Browser](https://blogs.aws.amazon.com/javascript/post/Tx1F7FO6GDAIXD3/Authentication-with-Amazon-Cognito-in-the-Browser)
* [configuring the SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/browser-configuring.html)
* [using WebPack with Amazon Cognito Identity SDK for JavaScript](https://aws.amazon.com/blogs/mobile/using-webpack-with-the-amazon-cognito-identity-sdk-for-javascript/)

## Principles

To begin with, you need a user pool.

You also need IAM restricted access.

* [configuring the SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/browser-configuring.html)

Cognito is better than two alternatives for access to AWS resources:

* raw key-and-secret credentials: Cognito in fact enables you to securely exchange a userid+password at login time for a time-limited key+secret
* OAuth authentication alone via Facebook and other authentication providers (though Cognito does play very nicely with that)

For Cognito to work for a given application, you need

* a user pool, which have a nice name and a hashy ID (and be in a region)
* an application to access, which is associated with that pool, and also has name and ID
* an identity pool, which enables access to unauthenticated identities
* roles for both authenticated and unauthenticated identities
* AWS resources, such as S3 buckets, whose access permissions are tied to the said roles
