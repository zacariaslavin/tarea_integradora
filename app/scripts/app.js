"use strict";

angular
  .module("obrasMduytApp", [
    "ngRoute",
    "ngSanitize",
    "slugifier",
    "angular-flexslider",
    "leaflet-directive",
    "ngYoutubeEmbed",
    "ngTable"
  ])
  .config(function(
    $routeProvider,
    $logProvider,
    $httpProvider,
    $locationProvider,
    $provide,
    $sceDelegateProvider
  ) {
    $routeProvider
      .when("/home", {
        templateUrl: "views/home.html",
        controller: "HomeCtrl",
        controllerAs: "home"
      })
      .when("/buscador", {
        templateUrl: "views/buscador.html",
        controller: "BuscadorCtrl",
        controllerAs: "buscador"
      })
      .when("/obra/:id", {
        templateUrl: "views/obra.html",
        controller: "ObraCtrl",
        controllerAs: "obra"
      })
      .when("/entorno/:entorno", {
        templateUrl: "views/entorno.html",
        controller: "EntornoCtrl",
        controllerAs: "entorno"
      })
      .otherwise({
        redirectTo: "/home"
      });
    $logProvider.debugEnabled(false);
    $locationProvider.hashPrefix("");

    $provide.decorator("$locale", [
      "$delegate",
      function($delegate) {
        $delegate.NUMBER_FORMATS.DECIMAL_SEP = ",";
        $delegate.NUMBER_FORMATS.GROUP_SEP = ".";
        return $delegate;
      }
    ]);

    $sceDelegateProvider.resourceUrlWhitelist([
      "self", // trust all resources from the same origin
      "*://ws.usig.buenosaires.gob.ar/**" // trust all resources from `ws.usig.buenosaires.gob.ar`
    ]);
  })
  .service("DataService", function($http, $q, Slug, $sce) {
    var data, dataMapas;

    var getUrlMapas = function() {
      if(!window.MDUYT_CONFIG){
        throw 'Archivo de configuración inexistente';
      }

      var url;
      if (window.MDUYT_CONFIG.LOAD_USING === 'GET_REQUEST') {
        url = window.MDUYT_CONFIG.MAPAS_CSV;
      } else if (window.MDUYT_CONFIG.LOAD_USING === 'JSONP_PROXY') {
        url = window.MDUYT_CONFIG.JSON_PROXY + '?source_format=csv&source=' + window.MDUYT_CONFIG.MAPAS_CSV;
      }
      return $sce.trustAsResourceUrl(url);
    };

    this.getById = function(id) {
      var result;
      var deferred = $q.defer();
      this.retrieveAll().then(function(all) {
        result = all.filter(function(a) {
          return a.id === parseInt(id);
        });
        deferred.resolve(result[0]);
      });
      result = deferred.promise;
      return $q.when(result);
    };

    this.getByEntorno = function(entorno) {
      var result;
      var deferred = $q.defer();
      this.retrieveAll().then(function(all) {
        result = all.filter(function(a) {
          return a.entorno_slug === entorno;
        });
        deferred.resolve(result);
      });
      result = deferred.promise;
      return $q.when(result);
    };

    this.getAll = function() {
      var result;
      var deferred = $q.defer();
      this.retrieveAll().then(function(all) {
        deferred.resolve(all);
      });
      result = deferred.promise;
      return $q.when(result);
    };

    this.getMapas = function() {
      var result;
      var deferred = $q.defer();
      this.retrieveMapas().then(function(all) {
        deferred.resolve(all);
      });
      result = deferred.promise;
      return $q.when(result);
    };

    this.retrieveMapas = function() {
      var urlMapas = getUrlMapas();

      var deferred = $q.defer();

      if (urlMapas == "") {
        dataMapas = [];
      }

      if (!dataMapas) {
        $http.jsonp(urlMapas).then(
          function(result) {
            dataMapas = result.data;
            deferred.resolve(dataMapas);
          },
          function(error) {
            console.log("error: ", error);
            data = error;
            deferred.reject(error);
          }
        );

        dataMapas = deferred.promise;
      }

      return $q.when(dataMapas);
    };

    this.retrieveAll = function() {
      if (!data) {
        data = loadData($sce, $q, $http, Slug);
      }

      return $q.when(data);
    };
  })
  .filter("capitalize", function() {
    return function(input) {
      return !!input
        ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase()
        : "";
    };
  })
  .filter("cleanunderscore", function() {
    return function(input) {
      return input.replace(/_/g, " ");
    };
  })
  .run(function() {});

function fetchId(link) {
  var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  var q = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = link.match(q);
  var id = link.match(p);
  if (id !== null) {
    var ytId = id[1];
    return ytId;
  }
}

function getYoutubePic(f) {
  var id = fetchId(f);
  return "https://img.youtube.com/vi/" + id + "/hqdefault.jpg;";
}
