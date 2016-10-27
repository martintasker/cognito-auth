'use strict';

var fs = require('fs');
var path = require('path');

var settings = {};
var SETTINGS_FILE = path.join(__dirname, '../settings.json');

function load() {
  try {
    settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  } catch (e) {
    settings = {};
  }
}

function save() {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2) + '\n');
}

function set(key, value) {
  settings[key] = value;
  save();
}

function get(key) {
  return settings[key];
}

load();
exports.set = set;
exports.get = get;
