"use strict";

angular
  .module("obrasMduytApp")
  .component('obraContent', {
    templateUrl: '/views/obra-content.html',
    controller: function($scope, $element, $attrs) {
      this.$onInit = function() {
        $scope.obra = this.obra;
      };
    },
    bindings: {
      obra: '<'
    }
  })
  .component('obrasSlider', {
    templateUrl: '/views/obras-slider.html',
    controller: function($scope, $element, $attrs) {
      $scope.currentSlide = 0;
      this.$onInit = function() {
        $scope.data = this.data;
      };
      $scope.nextSlide = function() {
        $scope.currentSlide++;
        if($scope.currentSlide >= $scope.data.obras.length) $scope.currentSlide = $scope.data.obras.length - 1;
      };
      $scope.prevSlide = function() {
        $scope.currentSlide--;
        if($scope.currentSlide < 0) $scope.currentSlide =  0;
      };
      $scope.gotoSlide = function(pos) {
        $scope.currentSlide = pos;
      };
    },
    bindings: {
      data: '<'
    }
  }).controller("ObrasBajoTierraCtrl", function($scope, DataService, anchorSmoothScroll) {
    $scope.loading = true;

    $scope.pymChild = new window.pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

    $scope.obrasBajoNivel = {
      title: 'Túneles y pasos bajo nivel',
      intro: 'Desde 2015 a 2018, invertimos más de 15 mil millones de pesos para reemplazar barreras y mejorar el tránsito y la seguridad de los peatones a través de 7 nuevos pasos bajo nivel, 2 viaductos y túneles.',
      icon: '/images/bajo-tierra/icon-underground.svg',
      obras: []
    };
    $scope.obrasSubte = {
      title: 'Más estaciones de subte, vecinos más conectados',
      intro: 'Desde 2015 hasta 2018, invertimos más de 3.300 millones de pesos en la creación y la extensión de las líneas H y E de subterráneos. Las obras empezaron en 2009 y su finalización se proyecta hacia enero de 2019.',
      icon: '/images/bajo-tierra/icon-train.svg',
      obras: []
    };
    $scope.obrasHidraulicas = {
      title: 'El agua que corre bajo tierra',
      intro: 'Más de 10 cuencas hidrográficas atraviesan la Ciudad. Por eso, durante los últimos cuatro años, invertimos más de 2.400 millones de pesos en infraestructura de obras hidráulicas, redes pluviales y sistemas de bombeo.',
      icon: '/images/bajo-tierra/icon-faucet.svg',
      obras: []
    };

    $scope.gotoElement = function (eID){
      // call $anchorScroll()
      anchorSmoothScroll.scrollTo(eID);

    };
    DataService.getAll().then(function(data) {

      data.forEach( item => {
        if(item.bajo_tierra == 'Subte') {
          $scope.obrasSubte.obras.push(item);
        }
        if(item.bajo_tierra == 'Paso bajo nivel') {
          $scope.obrasBajoNivel.obras.push(item);
        }
        if(item.bajo_tierra == 'Hidráulica') {
          $scope.obrasHidraulicas.obras.push(item);
        }
      });
      /*console.log($scope.obrasSubte);
      console.log($scope.obrasBajoNivel);
      console.log($scope.obrasHidraulicas);*/
      $scope.loading = false;
    });
  });
