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

    var getMontoRange = function(n) {
      var cincuentaM = 50000000;
      /*
        0 a 50 millones
        50 millones a 100 millones
        100 millones a 150 millones
        150 millones para adelante
      */
      var range = "monto_mas_50";
      if (_.inRange(n, 0, cincuentaM)) {
        range = "monto_0_50";
      } else if (_.inRange(n, cincuentaM, cincuentaM * 2)) {
        range = "monto_50_100";
      } else if (_.inRange(n, cincuentaM * 2, cincuentaM * 3)) {
        range = "monto_100_150";
      } else {
        //más de 150 millones
        range = "monto_mas_50";
      }
      return range;
    };

    var cleanData = function(oldReg) {
      var reg = {};
      for (var key in oldReg) {
        if (oldReg.hasOwnProperty(key)) {
          reg[key.toLowerCase()] = oldReg[key];
        }
      }

      reg.compromiso = reg.compromiso == "SI" ? true : false;
      reg.destacada = reg.destacada == "SI" ? true : false;
      reg.ba_elige = reg.ba_elige == "SI" ? true : false;

      //arrays
      //reg.tipo = (reg.tipo)?reg.tipo.split('|'):[];
      var comunas = reg.comuna ? reg.comuna.split("|") : [null];
      reg.comuna = comunas[0];
      reg.comuna = reg.comuna ? parseInt(reg.comuna.trim()) : reg.comuna;
      reg.barrio = reg.barrio ? reg.barrio.split("|") : [];
      reg.licitacion_oferta_empresa = reg.licitacion_oferta_empresa
        ? reg.licitacion_oferta_empresa
        : null;

      reg.mano_obra = reg.mano_obra ? parseInt(reg.mano_obra) : null;
      //setup slider

      //numbers
      reg.id = parseInt(reg.id);
      reg.licitacion_anio = reg.licitacion_anio
        ? parseInt(reg.licitacion_anio.trim())
        : null;
      reg.monto_contrato = reg.monto_contrato
        ? parseFloat(reg.monto_contrato.trim())
        : null;
      reg.licitacion_presupuesto_oficial = reg.licitacion_presupuesto_oficial
        ? parseFloat(reg.licitacion_presupuesto_oficial.trim())
        : null;
      reg.plazo_meses = reg.plazo_meses
        ? parseInt(reg.plazo_meses.trim())
        : null;
      reg.porcentaje_avance = reg.porcentaje_avance
        ? reg.porcentaje_avance.trim()
        : "";
      reg.porcentaje_avance.trim();
      reg.porcentaje_avance = isNaN(reg.porcentaje_avance)
        ? ""
        : reg.porcentaje_avance;
      reg.porcentaje_avance = reg.porcentaje_avance
        ? parseFloat(reg.porcentaje_avance)
        : null;

      reg.porcentaje_avance =
        reg.etapa === "Finalizada" ? 100 : reg.porcentaje_avance;

      reg.hideDates =
        reg.etapa === "En proyecto" || reg.etapa === "En licitación";

      reg.fotos = [];
      for (var i = 1; i <= 4; i++) {
        var key = "imagen_" + i;
        if (reg[key]) {
          reg.fotos[i - 1] = reg[key];
        }
      }

      reg.thumb = reg.fotos[0] ? reg.fotos[0] : "";

      reg.slides = reg.fotos.map(function(f) {
        return {
          mode: f.includes("youtu") ? "video" : "photo",
          url: f,
          pic: f.includes("youtu") ? getYoutubePic(f) : f
        };
      });
      //slug
      reg.entorno_slug = reg.entorno ? Slug.slugify(reg.entorno.trim()) : null;

      reg.etapa_slug = reg.etapa ? Slug.slugify(reg.etapa.trim()) : null;

      reg.tipo_slug = reg.tipo ? Slug.slugify(reg.tipo.trim()) : null;

      reg.area_slug = reg.area_responsable
        ? Slug.slugify(reg.area_responsable.trim())
        : null;

      reg.red_slug = reg.red ? Slug.slugify(reg.red.trim()) : null;

      reg.monto_slug = reg.monto_contrato
        ? getMontoRange(reg.monto_contrato)
        : null;

      reg.map =
        reg.lat && reg.lng
          ? "https://maps.googleapis.com/maps/api/staticmap?center=" +
            reg.lat +
            "," +
            reg.lng +
            "&zoom=18&size=300x100&maptype=roadmap&markers=color:blue%7Clabel:%7C" +
            reg.lat +
            "," +
            reg.lng +
            "&key=AIzaSyBNzIaO8-waiNE1fjdDOAI4TN00ALkOa4o"
          : "";

      return reg;
    };

    var etapas_validas = [
      "en-proyecto",
      "en-licitacion",
      "en-ejecucion",
      "finalizada"
    ];

    var filterData = function(reg) {
      var cond1 = etapas_validas.indexOf(reg.etapa_slug) > -1;
      return cond1;
    };

    var verifyConfig = function() {
      if (!window.MDUYT_CONFIG) {
        console.warn(
          "Archivo de configuración inexistente, utilizando configuración default de desarrollo."
        );
        window.MDUYT_CONFIG = {
          BASE_URL: "https://csv-to-api-compromisos.herokuapp.com/",
          HOME_CSV: "https://goo.gl/vcb6oX",
          MAPAS_CSV: "https://goo.gl/YYV2E7"
        };
        if (window.location.href.indexOf("dist") > -1) {
          L.Icon.Default.imagePath = "/dist/images";
        } else {
          L.Icon.Default.imagePath = "images";
        }
      } else {
      }
    };

    var getUrl = function() {
      verifyConfig();
      var url =
        window.MDUYT_CONFIG.BASE_URL +
        "?source_format=csv&source=" +
        window.MDUYT_CONFIG.HOME_CSV;
      return $sce.trustAsResourceUrl(url);
    };

    var getUrlMapas = function() {
      verifyConfig();
      var url = "";
      if (window.MDUYT_CONFIG.MAPAS_CSV) {
        url =
          window.MDUYT_CONFIG.BASE_URL +
          "?source_format=csv&source=" +
          window.MDUYT_CONFIG.MAPAS_CSV;
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
        var deferred = $q.defer();
        $http.jsonp(getUrl()).then(
          function(result) {
            data = result.data.map(cleanData).filter(filterData);
            deferred.resolve(data);
          },
          function(error) {
            data = error;
            deferred.reject(error);
          }
        );

        data = deferred.promise;
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
