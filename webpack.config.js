var webpack = require('webpack');

module.exports = {
  entry: [
    "./demo/app/scripts/cognito-auth/cognito-auth.js",
    "./demo/app/scripts/cognito-auth/cognito-auth.module.js",
    "./demo/app/scripts/cognito-auth/cognito-auth.service.js",
  ],
  output: {
    path: 'dist',
    filename: 'cognito-auth.js',
  }
};
