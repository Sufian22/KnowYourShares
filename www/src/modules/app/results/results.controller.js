'use strict';

module.exports = /*@ngInject*/
    function resultsController($scope, $state, getBusiness) {
        /*
         * Helper functions
         */
        function getRoundValues(round) {
            return _.map(round, function (people) {
                return people.value;
            })
        }

        function getRoundLabels(rounds) {
            return _.pluck(rounds, 'name');
        }

        function sum(a, b) {
            return a + b
        }

        function getValuationForPeople(people, showShares, roundValuation){
            console.log('is Percentage valuation ' + showShares);
            console.log('People ', people);
            if(showShares){
                return formatNumber(people.value);
            }
            else{
                return formatNumber(people.value * roundValuation / 100);
            }
        }

        function kValueInterpolation(value) {
                        return value + 'k';
        }

        function formatNumber(a) {
            return parseFloat(a.toFixed(2));
        }


        $scope.businessKeys = {
            id: $state.params.id,
            password: $state.params.password
        };

        $scope.goEdit = function () {
            $state.go('app.filters.location', $scope.businessKeys);
        };

        getBusiness.get($scope.businessKeys).$promise.then(function (response) {
            $scope.data = response.data;

            doLineChart('#sharesChartLine', false, true);

            doLineChart('#preMoneyChartLine', true);
            doLineChart('#postMoneyChartLine', false);

            doPieChart('#totalPieChartGrouped', true);
            doPieChart('#totalPieChartUngrouped', false);

            doBarChart('#preMoneyChartBar', false);
            doBarChart('#postMoneyChartBar', false);

            buildCapTables();

        }, function (err) {
            console.log('error ', err);
            $state.go('app.home');
        });


        function getFinalRoundPie(grouped) {

            var finalRound = $scope.data.rounds[$scope.data.rounds.length - 1];

            var hash = {};
            if (grouped) {
                var founders = finalRound.founders;
                var investors = finalRound.investors;
                hash.labels = ['Founders', 'Investors'];
                hash.series = [
                    _.pluck(founders, 'value').reduce(sum),
                    _.pluck(investors, 'value').reduce(sum)
                ];
            }
            else {
                var allPeople = finalRound.founders.concat(finalRound.investors);
                hash.labels = getRoundLabels(allPeople);
                hash.series = getRoundValues(allPeople);
            }
            return hash;
        }

        function doPieChart(selector, group) {

            var data = getFinalRoundPie(group);

            function pieChartInterpolationFunc(label, index) {
                return label + ' : ' +  data.series[index] + 'k';
            }

            var options = {
                plugins: [Chartist.plugins.tooltip()
                ],
                labelInterpolationFnc: pieChartInterpolationFunc,

            };

            new Chartist.Pie(selector, data, options);
        }


        function buildCapTables() {
          $scope.preMoneyValues = [];
          $scope.postMoneyValues = [];

          $scope.data.rounds.forEach(function (r) {
            var preMoney = r.preMoney;
            var postMoney = r.postMoney;

            var valorPre = 0;
            var valorPost = 0;
            r.investors.forEach(function (i) {
              valorPre = calculate(i.value, preMoney);
              valorPost = calculate(i.value, postMoney);
              $scope.preMoneyValues.push({name: i.name, shares: i.value, value: valorPre, preMoneyValue:preMoney});
              $scope.postMoneyValues.push({name: i.name, shares: i.value, value: valorPost, postMoneyValue:postMoney});
            });
            r.founders.forEach(function (f) {
              valorPost = calculate(f.value, postMoney);
              valorPre = calculate(f.value, preMoney);
              $scope.preMoneyValues.push({name: f.name, shares: f.value, value: valorPre, preMoneyValue:preMoney});
              $scope.postMoneyValues.push({name: f.name, shares: f.value, value: valorPost, postMoneyValue:postMoney});
            });
          });
        }

        function calculate(shares, postmoney) {
          return (shares/100)*postmoney;
        }


        function getAllRoundSeries(rounds, byPremoney, showShares) {
            var hash = {};

            var totalRounds = rounds.length;

            _.map(rounds, function (round) {
                var roundValuation = byPremoney ? round.preMoney : round.postMoney;

                console.log('Round valuation ', roundValuation);

                var allPeopleInRound = round.founders.concat(round.investors);
                _.map(allPeopleInRound, function (people) {
                    //console.log('People ', people)
                    var roundValueForPeople = {
                        meta: people.name,
                        value: getValuationForPeople(people,showShares,roundValuation),
                        round : round.name
                    };

                    if (hash.hasOwnProperty(people.name)) {
                        hash[people.name].values.push(roundValueForPeople);
                    } else {
                        hash[people.name] = {
                            name: people.name,
                            values: [roundValueForPeople]
                        }
                    }
                });
            });

            var series = _.pluck(hash, 'values');

            var result = _.map(series,function(array){
                for(var i = totalRounds - array.length; i > 0; --i){
                    array.unshift([]);
                }
                return array;
            });

            return result;

        }

        function doBarChart(selector, byPremoney, labels, series) {
            labels = labels || getRoundLabels($scope.data.rounds);
            series = series || getAllRoundSeries($scope.data.rounds, byPremoney);

            var data = {
                labels: labels,
                series: series
            };

            var options = {
                plugins: [
                    Chartist.plugins.tooltip()
                ],
                seriesBarDistance: 15,
                axisY: {
                       labelInterpolationFnc: kValueInterpolation
                }
            };

            var responsiveOptions = [
                ['screen and (min-width: 641px) and (max-width: 1024px)', {
                    seriesBarDistance: 10,
                    axisX: {
                        labelInterpolationFnc: kValueInterpolation
                    }
                }],
                ['screen and (max-width: 640px)', {
                    seriesBarDistance: 5,
                    axisX: {
                        labelInterpolationFnc: function (value) {
                            return kValueInterpolation(value[0]);
                        }
                    }
                }]
            ];
            new Chartist.Bar(selector, data, options, responsiveOptions);
        }

        function doLineChart(selector, byPremoney, showShares, labels, series) {
            // Our labels and three data series
            console.log('BY PERCENTAGE ' , showShares);

            labels = labels || getRoundLabels($scope.data.rounds);
            series = series || getAllRoundSeries($scope.data.rounds, byPremoney, showShares);

            console.log('labels ' , labels);
            console.log('SERIES ' , series);

            var data = {
                labels: labels,
                series: series
            };

            function getInterpolationFunction(showShares){
                if(showShares){
                    return function(a){return formatNumber(a)}
                }else{
                    return kValueInterpolation
                }
            }

            // We are setting a few options for our chart and override the defaults
            var options = {
                plugins: [
                    Chartist.plugins.tooltip()
                ],
                // Don't draw the line chart points
                showPoint: true,
                // Disable line smoothing
                lineSmooth: false,
                // X-Axis specific configuration
                axisX: {
                    // We can disable the grid for this axis
                    showGrid: true,
                    // and also don't show the label
                    showLabel: true
                },
                // Y-Axis specific configuration
                axisY: {
                    // Lets offset the chart a bit from the labels
                    offset: 60,
                    // The label interpolation function enables you to modify the values
                    // used for the labels on each axis. Here we are converting the
                    // values into million pound.
                    labelInterpolationFnc: getInterpolationFunction(showShares)
                }
            };
            // All you need to do is pass your configuration as third parameter to the chart function
            new Chartist.Line(selector, data, options);
        }




        $scope.doPieChart = doPieChart;
        $scope.doLineChart = doLineChart;
        $scope.doBarChart = doBarChart;
    };
