"use strict";

angular
  .module("obrasMduytApp")
  .controller("ObraCtrl", function($scope, DataService, $routeParams) {
    $scope.i18n = window._i18n;

    $scope.loading = true;

    $scope.pymChild = new window.pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();
    $scope.obraId = $routeParams.id;
    $scope.tipo_colors = function(d){
      var c = [];
       c["Espacio Público"] = "#A7C64D";
       c["Escuelas"] = "#7874B2";
       c["Salud"] = "#F1AD3C";
       c["Arquitectura"] = "#38A0D7";
       c["Hidráulica e Infraestructura"] = "#BD3E93";
       c["Transporte"] = "#E84D00";
       c["Vivienda"] = "#22B496";

      return c[d];
    };


    var tilesUSIG;
    if (window.MDUYT_CONFIG.USE_USIG_MAP_TILES) {
      tilesUSIG = {
        url: "//tiles1.usig.buenosaires.gob.ar/mapcache/tms/1.0.0/amba_con_transporte_3857@GoogleMapsCompatible/{z}/{x}/{y}.png",
        format: "tms",
        builder: "tms",
        baseLayer: true,
        options: {
          maxZoom: 18,
          minZoom: 9,
          attribution: 'USIG (<a href="http://www.buenosaires.gob.ar" target="_blank">GCBA</a>), © <a href="http://www.openstreetmap.org/copyright/en" target="_blank">OpenStreetMap</a> (ODbL)',
          tms: true
        }
      };
    } else {
      tilesUSIG = {
        url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        baseLayer: true
      };
    }

    $scope.titles = tilesUSIG;
    angular.extend($scope, {
      markers: {},
      center: {
        lat: -34.604,
        lng: -58.382,
        zoom: 15
      },
      tiles: tilesUSIG,
      defaults: {
        scrollWheelZoom: false
      }
    });

    $scope.mainCallback = function(callback) {
      $scope.drawLineOnObraLoaded = callback;
    };
    $scope.drawFirstColored = function(callback) {
      $scope.firstColoredLoaded = callback;
    };
    $scope.drawSecondColored = function(callback) {
      $scope.secondColoredLoaded = callback;
    };
    DataService.getById($routeParams.id).then(function(data) {
      $scope.obra = data;
      if (!data.hideDates && $scope.drawLineOnObraLoaded) {
        $scope.drawLineOnObraLoaded(data);
      }
      if (data.beneficiarios && $scope.firstColoredLoaded) {
        $scope.firstColoredLoaded(data);
      }
      if (data.mano_obra && $scope.secondColoredLoaded) {
        $scope.secondColoredLoaded(data);
      }
      //setup slider
      $scope.slides = data.fotos.map(function(f) {
        return {
          mode: f.includes("youtu") ? "video" : "photo",
          url: f,
          pic: f.includes("youtu") ? getYoutubePic(f) : f
        };
      });
      //Setup Map
      angular.extend($scope, {
        center: {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
          zoom: 15
        },
        markers: {
          m1: {
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lng),
            focus: true,
            message: data.nombre
          }
        }
      });
      $scope.center.lat = parseFloat(data.lat);
      $scope.center.lng = parseFloat(data.lng);

      //Setup time line
      var time = {
        starting_time: data.fecha_inicio,
        ending_time: data.fecha_fin_inicial
      };

      $scope.loading = false;
    });
  });
