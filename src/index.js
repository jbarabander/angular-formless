var directives = require('./directives');
var app = angular.module('formless', []);

app.directive('formless', directives.formless);

module.exports = 'formless';
