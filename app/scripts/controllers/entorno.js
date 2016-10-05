'use strict';

angular.module('obrasMduytApp')
  .controller('EntornoCtrl', function ($scope,DataService,$routeParams) {

  	$scope.pymChild = new pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

    DataService.getByEntorno($routeParams.entorno)
    .then(function(data){
    	console.log(data);
    	$scope.data = data;
    });

  });
