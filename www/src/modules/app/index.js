'use strict';

Object.defineProperty(Array.prototype, 'totalSumByField',{
  value: function(key){var value = 0; this.forEach(function(obj){ value += (obj[key] || 0); }); return value; },
  enumerable: false
});


module.exports =
  angular.module('app', [
    'ui.router',
    //load extra external dependencies here, e.g.:
    //'ngAnimate',
    'ngResource',
    'ui.router.stateHelper',
    'ngMaterial',
    'material.svgAssetsCache',
    'chart.js',
    'ngMessages',
    'angular-clipboard',
    require('angular-chartist.js'),
    //html templates in $templateCache generated by Gulp:
    require('../../../tmp/templates').name,
    require('../directives').name,
    require('../resources').name,
    require('../services').name,
    require('./home').name,
    require('./filters').name,
    require('./results').name
  ])
    .config(require('./app.config'))
    .config(require('./app.config.routes'))
    .controller('appController', require('./app.controller'));
