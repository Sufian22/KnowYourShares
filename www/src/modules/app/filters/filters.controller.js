'use strict';

module.exports = /*@ngInject*/
  function filtersController($scope, $rootScope, createBusiness, putBusiness, getBusiness, $state, $location, $mdToast, clipboard, $mdDialog, roundService,$interval) {
    function initialize() {
      $scope.link = {
        readOnly: true
      };

      $scope.businessKeys = {
        id: $state.params.id,
        password: $state.params.password
      };

      $scope.saveStatus = {
        alreadySaved : false,
        saving : false,
        autoSave: false
      };

      $scope.host = 'localhost:8080/';
      $scope.businessPath = 'business/';
      $scope.selectedIndex = 0;
      $scope.password = $state.params.password || '';

      getBusiness.get($scope.businessKeys).$promise.then(function(response) {
        $scope.data = response.data;
        $scope.link.readOnly = !$scope.data.canEdit;
        $scope.buildPath();
        roundService.inputCurrentState(response.data);
      }, function(err) {
        console.log('error ', err);
        $state.go('app.home');
      });

      if (!clipboard.supported) {
        console.log('Sorry, copy to clipboard is not supported');
      }
      $scope.isOpen = false;
      $scope.selectedMode = 'md-scale';
      $scope.selectedDirection = 'up';
    }


    $scope.buildPath = function buildPath() {
      $scope.readOnlyPath = $scope.host + $scope.businessPath + $scope.data._id;
      $scope.editPath = $scope.readOnlyPath + '/' + $scope.password;
    };

    $scope.createRound = function() {
      mixpanel.track("User Create a new Round");
      $scope.data = roundService.createRound($scope.data);

      $scope.selectedIndex = $scope.data.rounds.length - 1;
      $scope.save();
    };

    $scope.removeRound = function(index) {
      mixpanel.track("User Remove a Round");
      $scope.data.rounds.splice(index, 1);
      $scope.selectedIndex = $scope.data.rounds.length - 1;
    };

    $scope.copyToClipboard = function() {
      mixpanel.track("User Copy URL");
      clipboard.copyText($scope.link.readOnly ? $scope.readOnlyPath : $scope.editPath);
      $mdToast.show($mdToast.simple().textContent('Link copied to clipboard!'));
    };

    $scope.save = function save() {
      mixpanel.track("User save the state");

      //We trigger auto updates
      if(!$scope.saveStatus.alreadySaved){
        $scope.saveStatus.alreadySaved = true;
        $scope.enableAutoSave();
      }

      console.log('Saving...');
      $scope.saveStatus.saving = true;
      putBusiness.save($scope.businessKeys, $scope.data).$promise.then(function(data) {
        $mdToast.show($mdToast.simple().textContent('Changes saved.').position('top right'));
        $scope.data = data;
        $scope.saveStatus.lastSave = new Date();
      }, function() {
        $mdToast.show($mdToast.simple().textContent('Error saving.').position('top right'));
      }).finally(function(){
        $scope.saveStatus.saving = false;
      });
    };

    var autoSaveInterval;

    $scope.enableAutoSave = function(){
      autoSaveInterval = $interval($scope.save, 120000);
    };

    $scope.disableAutoSave = function(){
      $interval.cancel(autoSaveInterval);
      autoSaveInterval = null;
    };

    initialize();
  };
