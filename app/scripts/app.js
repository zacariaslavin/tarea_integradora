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
      .when("/obras-bajo-tierra", {
        templateUrl: "views/obras-bajo-tierra.html",
        controller: "ObrasBajoTierraCtrl",
        controllerAs: "ObrasBajoTierra"
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
  .service('anchorSmoothScroll', function ($document, $window) {

    var document = $document[0];
    var window = $window;

    function getCurrentPagePosition(window, document) {
      // Firefox, Chrome, Opera, Safari
      if (window.pageYOffset) return window.pageYOffset;
      // Internet Explorer 6 - standards mode
      if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;
      // Internet Explorer 6, 7 and 8
      if (document.body.scrollTop) return document.body.scrollTop;
      return 0;
    }

    function getElementY(document, element) {
      var y = element.offsetTop;
      var node = element;
      while (node.offsetParent && node.offsetParent != document.body) {
        node = node.offsetParent;
        y += node.offsetTop;
      }
      return y;
    }

    this.scrollDown = function (startY, stopY, speed, distance) {

      var timer = 0;

      var step = Math.round(distance / 25);
      var leapY = startY + step;

      for (var i = startY; i < stopY; i += step) {
        setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
        leapY += step;
        if (leapY > stopY) leapY = stopY;
        timer++;
      }
    };

    this.scrollUp = function (startY, stopY, speed, distance) {

      var timer = 0;

      var step = Math.round(distance / 25);
      var leapY = startY - step;

      for (var i = startY; i > stopY; i -= step) {
        setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
        leapY -= step;
        if (leapY < stopY) leapY = stopY;
        timer++;
      }
    };

    this.scrollToTop = function (stopY) {
      scrollTo(0, stopY);
    };

    this.scrollTo = function (elementId, speed) {
      // This scrolling function
      // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

      var element = document.getElementById(elementId);

      if (element) {
        var startY = getCurrentPagePosition(window, document);
        var stopY = getElementY(document, element);

        var distance = stopY > startY ? stopY - startY : startY - stopY;

        if (distance < 100) {
          this.scrollToTop(stopY);

        } else {

          var defaultSpeed = Math.round(distance / 100);
          speed = speed || (defaultSpeed > 20 ? 20 : defaultSpeed);

          if (stopY > startY) {
            this.scrollDown(startY, stopY, speed, distance);
          } else {
            this.scrollUp(startY, stopY, speed, distance);
          }
        }

      }

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
