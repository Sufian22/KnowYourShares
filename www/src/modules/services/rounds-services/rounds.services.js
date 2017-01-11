'use strict';

module.exports = /*@ngInject*/
  function roundService(/* inject dependencies here, i.e. : $rootScope */) {
    var currentState;
    var _createRound = function (data) {
      currentState = data;
      var newRound = {};
      if(data) {
        if (!data.rounds || !data.rounds.length) {
          console.log("FIRST");
          newRound.name = "Initial State";
          newRound.preMoney = data.companyValue || 0;
          newRound.moneyRaised = 0;
          newRound.postMoney = newRound.preMoney + newRound.moneyRaised;
          newRound.founders = data.founders;
          newRound.investors = data.investors;
          newRound.employees = data.employees;
          data.rounds = [];
        } else {
          var lastRound = data.rounds[data.rounds.length - 1];
          newRound.name = "Event " + (data.rounds.length);
          newRound.preMoney = lastRound.postMoney;
          newRound.moneyRaised = 0;
          newRound.postMoney = newRound.preMoney + newRound.moneyRaised;
          newRound.founders = lastRound.founders;
          newRound.investors = lastRound.investors;
          newRound.employees = lastRound.employees;
        }
        data.rounds[data.rounds.length] = angular.copy(newRound);
      }
      return data;
    };

    var _getLastRound = function () {
      if(currentState.rounds.length) {
        return currentState.rounds[currentState.rounds.length - 2];
      } else {
        return undefined;
      }
    };

    return {
      createRound: _createRound,
      getLastRound: _getLastRound
    };
  };
