// Karma configuration
// Generated on 2016-07-13

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      'jasmine'
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/ng-file-upload/ng-file-upload.js',
      'bower_components/aws-sdk/dist/aws-sdk.js',
      'bower_components/aws-cognito-sdk/index.js',
      'bower_components/amazon-cognito-identity/index.js',
      'bower_components/angular-mocks/angular-mocks.js',
      // endbower

      'app/scripts/cognito-auth/aws-cognito-sdk.min.js',
      'app/scripts/cognito-auth/amazon-cognito-identity.min.js',
      'app/scripts/cognito-auth/cognito-auth.js',
      'app/scripts/cognito-auth/cognito-user.service.js',

      'app/scripts/app.js',
      'app/scripts/user/user.component.js',
      'app/scripts/user/user-login.component.js',
      'app/scripts/user/user-logout.component.js',
      'app/scripts/recordings/recordings.component.js',
      'app/scripts/recordings/recordings.occasional-series.component.js',
      'app/scripts/recordings/recordings.list.component.js',
      'app/scripts/recordings/recording.item.component.js',
      'app/scripts/recordings/recordings.service.js',
      'app/scripts/upload/upload.service.js',
      'app/scripts/uploader/uploader.component.js',
      // test stuff
      'app/scripts/**/*.mock.js',
      'app/scripts/**/*.spec.js'
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 9021,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
