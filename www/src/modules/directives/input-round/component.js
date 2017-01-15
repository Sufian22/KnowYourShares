'use strict';
function InputRoundCtrl($scope, roundService,$mdDialog) {
  var ctrl = this;

  console.log("InputRoundCtrl");

  ctrl.round = ctrl.round ? ctrl.round : {};
  ctrl.round.founders = ctrl.round.founders || [];
  ctrl.round.investors = ctrl.round.investors || [];
  ctrl.round.index = ctrl.round.index || 0;
  ctrl.total = 0;
  ctrl.showGraph = 1;

  var lastRound;

  $scope.$watch('$ctrl.round.index', function(newValue) {
    lastRound = roundService.getLastRound(newValue);
  });

  ctrl.updateTotal = function(){
    console.log("updateTotal");
    ctrl.round.postMoney = ctrl.round.preMoney + ctrl.round.moneyRaised;
  };

  ctrl.modifyPostMoney = function(){
    console.log("postmoney");
    ctrl.round.moneyRaised = ctrl.round.postMoney - ctrl.round.preMoney;
  };

  ctrl.resetRound = function(){
    mixpanel.track("user reset round event");

    angular.copy(lastRound.founders, ctrl.round.founders);
    angular.copy(lastRound.investors, ctrl.round.investors);
    ctrl.modifyPostMoney();
    ctrl.updateTotal();
  };


}
InputRoundCtrl.$inject = ['$scope', 'roundService','$mdDialog'];

module.exports = {
  controller: InputRoundCtrl,
  bindings: {
    round : "=",
    indexRound : "<"
  },
  templateUrl: 'directives/input-round/template.html'
};
