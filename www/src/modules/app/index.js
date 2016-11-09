'use strict';

module.exports =
    angular.module('app', [
        'ui.router',
        //load extra external dependencies here, e.g.:
        //'ngAnimate',
        'ngMaterial',
        'ngResource',
        //html templates in $templateCache generated by Gulp:
        require('../../../tmp/templates').name,

    ])
        .config(require('./app.config'))
        .config(require('./app.config.routes'))
        .controller('appController', require('./app.controller'));
