"use strict";

angular
  .module("obrasMduytApp")
  .controller("ObrasBajoTierraCtrl", function($scope, DataService) {
    $scope.loading = true;

    $scope.pymChild = new window.pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

    DataService.getAll().then(function(data) {
      console.log(data);

      $scope.loading = false;
    });
  });
