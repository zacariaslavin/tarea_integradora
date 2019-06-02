"use strict";

angular
  .module("obrasMduytApp")
  .controller("HomeCtrl", function($scope, DataService, $filter, $http, $sce) {
    $scope.i18n = window._i18n;

    var d3 = window.d3;

    $scope.loading = true;
    $scope.pymChild = new window.pym.Child({
      polling: 1000
    });
    var chart = {};
    var scalechart = {};
    var bubbles = {};
    var compromisoIconSVG = "";
    d3.xml("images/iconos/compromiso.svg", function(e, d) {
      compromisoIconSVG = d;
    });
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
    $scope.selectedGroup = false;
    $scope.oldGroup = "mapa";
    $scope.selectedObra = false;

    var logoTipoCache = {};

    $scope.selectedFilter = false;
    $scope.labels = {};
    $scope.selectTypes = [];

    var mainSelect = {
      label: "-Todas las Obras",
      slug: "",
    }
    $scope.obrasTypeFilter = mainSelect;
    $scope.selectTypes.push(mainSelect)
    $scope.selectTypes.push({
      label: "Espacio Público",
      slug: "espacio-publico"
    })
    $scope.selectTypes.push({
      label: "Escuelas",
      slug: "escuelas"
    })
     $scope.selectTypes.push({
      label: "Salud",
      slug: "salud"
    })
    $scope.selectTypes.push({
      label: "Arquitectura",
      slug: "arquitectura"
    })
    $scope.selectTypes.push({
      label: "Vivienda",
      slug: "vivienda"
    })
      $scope.selectTypes.push({
      label: "Transporte",
      slug: "transporte"
    })

  $scope.selectTypes.push({
      label: "Hidráulica e Infraestructura",
      slug: "hidraulica-e-infraestructura"
    })



    $scope.labels["espacio-publico"] =
      "Obras e intervenciones en el espacio público, tales como obras en plazas y parques, en veredas o de regeneración urbana.";
    $scope.labels["escuelas"] =
      "Obras de construcción, refacción o puesta en valor de establecimientos educativos.";
    $scope.labels["arquitectura"] =
      "Obras civiles de reforma, puesta en valor o construcción de edificios.";
    $scope.labels["salud"] =
      "Obras de construcción, remodelación y puesta en valor en hospitales y centros de salud y atención comunitaria..";
    $scope.labels["vivienda"] =
      "Construcción de viviendas nuevas y obras de mejoras en viviendas existentes.";
    $scope.labels["transporte"] =
      "Obras de infraestructura destinadas al transporte público y a la construcción y mantenimiento de las vías de circulación. ";
    $scope.labels["hidraulica-e-infraestructura"] =
      "Comprende obras e intervenciones relacionadas con el tratamiento de fluidos (cursos de agua o desagües pluviales), así como obras de equipamiento, redes sanitarias, de gas o electricidad, necesarias para la vida en un entorno urbano.";

    $scope.selectedRadioDimension = "monto_contrato";

    $scope.tooltip = d3.select("#tooltip-home-chart");

    $scope.pymChild.sendHeight();

    var renderFunctions = {
      comunas: renderComunasGroup,
      montos: renderMontosGroup,
      etapas: renderEtapasGroup,
      mapa: renderMapGroup
    };

    var prepareNodesFunctions = {
      comunas: prepareNodesComunasGroup,
      montos: prepareNodesMontosGroup,
      etapas: prepareNodesEtapasGroup,
      mapa: prepareNodesMapGroup
    };

    var resetFunctions = {
      comunas: resetComunas,
      montos: resetMontos,
      etapas: resetEtapas,
      mapa: resetMap
    };

    var initialized = {
      comunas: false,
      montos: false,
      etapas: false,
      mapa: false
    };

    var _ = window._;

    var w = 0;

    $(window).load(function() {
      w = $(window).width();
    });

    DataService.getAll().then(function(data) {
      $scope.obras = data;
      $scope.selectedGroup = "mapa";

      $scope.useComunas = true;
      for (var l=0; l<$scope.obras.length; l++) {
        if ($scope.obras[l].comuna_from_jurisdiccion) {
          $scope.useComunas = false
        }
      }

      $scope.availableGroups = [
        { id: "mapa", name: "Mapa" },
        { id: "comunas", name: $scope.useComunas ? "Comunas" : "Jurisdicciones" },
        { id: "montos", name: "Inversión" },
        { id: "etapas", name: "Etapas" }
      ];

      $scope.loading = false;

      setTimeout(function() {
        renderChart();
      }, 1000);
      window.$(window).resize(function() {
        if (w != $(window).width()) {
          clearTimeout($scope.timeoutId);
          $scope.timeoutId = setTimeout(function() {
            initialized = {
              comunas: false,
              montos: false,
              etapas: false,
              mapa: false
            };
            renderChart();
          }, 1000);
        }
      });
    });

    $scope.textFilter = "";
    $scope.$watch("textFilter", function(newValue, oldValue) {
      if (!$scope.loading) {
        $scope.filterByText();
      }
    });
    $scope.filterByText = function() {
      $scope.textFilter = $('.text-filter').val();
      if ($scope.textFilter.length > 3) {
        $scope.filterBubbles($scope.selectedFilter, $scope.textFilter);
      }
      if ($scope.textFilter.length === 0) {
        $scope.filterBubbles($scope.selectedFilter);
      }
    };

    /** Generic Functions ====================================================== **/

    function renderChart() {
      chart.w = d3
        .select("#home-chart-container")
        .node()
        .getBoundingClientRect().width;

      chart.w = !chart.svg || chart.w < 500 ? chart.w  : chart.w;

      $scope.isSmallDevice = chart.w < 700 ? true : false;

      if ($scope.isSmallDevice) {
        chart.w = $(window).width();
        chart.h = $(window).width();
      } else {
        chart.h = chart.w;
        chart.margin = chart.w / 200;
      }

      if (!chart.svg) {

        //Create
        chart.svg = d3.select("#home-chart-container").append("svg");
        chart.mainGroup = chart.svg.append("g").classed("main-group", true);
        chart.mainGroup.append("rect").attr("fill", "white");

        chart.svg.append("g").attr("id", "comunas-group");
        chart.svg.append("g").attr("id", "map-group");
        chart.svg.append("g").attr("id", "etapas-group");
        chart.svg.append("g").attr("id", "montos-group");

        bubbles.group = chart.svg.append("g").attr("id", "bubbles-group");
        bubbles.icons = chart.svg.append("g").attr("id", "bubbles-icons");
        if ($scope.isSmallDevice){
          d3.selectAll('#bubbles-group').style('display',"none");
        }
        chart.selection = chart.svg
          .append("circle")
          .attr("class", "selection-cicle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 0)
          .style("fill", "none")
          .style("stroke", "black")
          .style("stroke-width", 2);
      }

      //Update
      chart.svg.attr("width", chart.w).attr("height", chart.h);

      chart.mainGroup
        .select("rect")
        .attr("width", chart.w)
        .attr("height", chart.h);

      //default, comunas
      $scope.showGroup();
    }

    function sortItems($items, itemW, itemH) {
      var xLimit = Math.floor(chart.w / itemW),
        xCount = 0,
        yCount = 0;

      $items
        .transition()
        .duration(700)
        .attr("transform", function(d, i) {
          var x = xCount * itemW;
          var y = yCount * itemH;
          if (xCount < xLimit - 1) {
            xCount++;
          } else if ($items[0].length !== i + 1) {
            xCount = 0;
            yCount++;
          }

          return "translate(" + x + "," + y + ")";
        });
    }

    $scope.filterBubbles = function(filterSlug) {

      if ($scope.selectedFilter == filterSlug) {
        d3.selectAll("circle.obra").style("opacity", 1);
        d3.selectAll("g.banderita").style("opacity", 1);
        filterSlug = false;
      }
      if (filterSlug == "" && $scope.textFilter == "") {
        d3.selectAll("circle.obra").style("opacity", 1);
        d3.selectAll("g.banderita").style("opacity", 1);
      } else if ($scope.textFilter == "") {
        d3.selectAll("circle.obra").style("opacity", 0.2);
        d3.selectAll("g.banderita").style("opacity", 0.2);
        d3.selectAll("circle.obra." + filterSlug).style("opacity", 1);
        d3.selectAll("g.banderita." + filterSlug).style("opacity", 1);
      } else {
        d3.selectAll("circle.obra").style("opacity", 0.2);
        var allText = $scope.textFilter.toLowerCase().split(" ");
        for (var i = 0; i < allText.length; i++) {
          var cls = "";
          if (filterSlug != "") {
            cls += "." + filterSlug;
          }
          cls += "." + allText[i];
          d3.selectAll("circle.obra" + cls).style("opacity", 1);
          d3.selectAll("g.banderita" + cls).style("opacity", 1);
        }
      }

      $scope.selectedFilter = filterSlug;
      $scope.closeTooltip();
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    };

    $scope.changeGroup = function(group) {
      $scope.selectedGroup = group;
      $scope.showGroup();
    };

    $scope.showGroup = function() {
      if ($scope.oldGroup !== $scope.selectedGroup) {
        $scope.closeTooltip();
        resetFunctions[$scope.oldGroup](true);
        chart.svg
          .selectAll(".child")
          .style("opacity", 0)
          .style("display", "none");
        chart.svg
          .selectAll("circle.obra")
          .transition()
          .style("opacity", 0.5);
        $scope.oldGroup = $scope.selectedGroup;
      }

      renderFunctions[$scope.selectedGroup]();

      var time =
        initialized[$scope.selectedGroup] || $scope.selectedGroup === "mapa"
          ? 100
          : 2000;
      initialized[$scope.selectedGroup] = true;

      setTimeout(function() {
        prepareNodesFunctions[$scope.selectedGroup]();
        renderBubbles();
      }, time);
    };

    /** MAPA Functions ====================================================== **/

    function renderMapGroup() {

      d3.json("geo/geometry.geojson", function (data) {
        var center = data && data.properties && data.properties.center ? data.properties.center : [-58.43992, -34.618];
        var scale = data && data.properties && data.properties.zoomLevel ? data.properties.zoomLevel : 240;
        chart.mapProjection = d3.geo
          .mercator()
          .center(center)
          .translate([chart.w / 2, chart.h / 2])
          .scale(scale * chart.w);

        chart.mapPath = d3.geo.path().projection(chart.mapProjection);

        function updateMap() {
          if ($scope.isSmallDevice) {
            chart.svg.attr("height", chart.w);
          }

          chart.mapGroup
            .selectAll("path.map-item")
            .style("display", "block")
            .style("stroke-width", 0)
            .transition()
            .duration(1000)
            .style("stroke-width", 3)
            .attr("d", chart.mapPath)
            .style("opacity", 1);

          chart.mapGroup
            .selectAll("text.map-text")
            .attr("x", function(d) {
              return chart.mapPath.centroid(d)[0];
            })
            .attr("y", function(d) {
              return chart.mapPath.centroid(d)[1];
            })
            .style("opacity", 1)
            .style("display", "block");
        }

        if (!chart.mapGroup) {
          chart.mapGroup = chart.svg.select("#map-group");

          chart.mapCentroids = {};

          chart.mapFeatures = data.features;

          _.each(chart.mapFeatures, function(f, i) {
            chart.mapCentroids[
            "mapa-comuna-" + (f.properties && f.properties.comuna ? f.properties.comuna : i)
              ] = chart.mapPath.centroid(f);
          });

          chart.mapGroup
            .selectAll("path.map-item")
            .data(chart.mapFeatures)
            .enter()
            .append("path")
            .classed("child", true)
            .classed("map-item", true)
            .attr("id", function(d, i) {
              return "mapa-comuna-" + (d.properties && d.properties.comuna ? d.properties.comuna : i);
            })
            .classed("shape", true)
            .on("click", clickedMap);

          chart.mapGroup
            .selectAll("text.map-text")
            .data(chart.mapFeatures)
            .enter()
            .append("text")
            .attr("class", "map-text")
            .classed("child", true)
            .attr("text-anchor", "middle")
            .attr("x", function(d) {
              return chart.mapPath.centroid(d)[0];
            })
            .attr("y", function(d) {
              return chart.mapPath.centroid(d)[1];
            })
            .text(function(d, i) {
              return d.properties && d.properties.comuna ? d.properties.comuna : '';
            });

          updateMap();
        } else {
          updateMap();
        }
      });

    }

    function prepareNodesMapGroup() {
      bubbles.clusters = {};
      bubbles.clusterPoints = {};

      bubbles.nodesComuna = [];

      bubbles.nodes = $scope.obras
        .filter(function(d) {
          return d.lat && d.lng;
        })
        .map(function(d) {
          var i = "i" + d.id,
            r = $scope.isSmallDevice ? 1.25 : 4,
            c = { cluster: i, radius: r, data: d };

          bubbles.clusters[i] = c;

          var point = chart.mapProjection([
            parseFloat(d.lng),
            parseFloat(d.lat)
          ]);

          bubbles.clusterPoints[i] = {
            x: point[0],
            y: point[1],
            radius: $scope.isSmallDevice ? 1.25 : 4
          };

          return c;
        });

      bubbles.scale = false;
    }

    var activeMap = d3.select(null);
    function clickedMap(d) {
      $scope.closeTooltip();
      if (activeMap.node() === this) {
        return resetMap();
      }
      activeMap.classed("active", false);
      activeMap = d3.select(this).classed("active", true);


      if($scope.isSmallDevice){
        // d3.selectAll('#bubbles-group').style('display',"block");
          $scope.$apply(function(){
          $scope.showList = true;
          $scope.selectedComuna = d.properties && d.properties.comuna;
          $scope.selectedJurisdiccion = d.properties && d.properties.id;
          $scope.filteredObras = $scope.obras.filter(function(o){
           return $scope.selectedComuna ?
             parseInt(o.comuna) === parseInt($scope.selectedComuna) :
             o.jurisdiccion === $scope.selectedJurisdiccion;
          })
        })
      }else {

      var bounds = chart.mapPath.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = 0.9 / Math.max(dx / chart.w, dy / chart.h),
        translate = [chart.w / 2 - scale * x, chart.h / 2 - scale * y];

      chart.mapGroup
        .transition()
        .duration(750)
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

      chart.mapGroup
        .selectAll("path")
        .transition()
        .duration(750)
        .style("stroke-width", 1 + "px");

      chart.selection
        .transition()
        .duration(750)
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

      bubbles.group
        .transition()
        .duration(750)
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

      bubbles.icons
        .transition()
        .duration(750)
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

      }
    }

    function resetMap() {
      if($scope.isSmallDevice){
        d3.selectAll('#bubbles-group').style('display',"none");
      }
      activeMap.classed("active", false);
      activeMap = d3.select(null);

      chart.mapGroup
        .transition()
        .duration(750)
        .attr("transform", "");

      chart.selection
        .transition()
        .duration(750)
        .attr("transform", "");

      chart.mapGroup
        .selectAll("path")
        .transition()
        .duration(750)
        .style("stroke-width", "3px");

      bubbles.icons
        .transition()
        .duration(750)
        .attr("transform", "");
      bubbles.group
        .transition()
        .duration(750)
        .attr("transform", "");
    }

    /** COMUNAS Functions ====================================================== **/

    function renderComunasGroup(clear) {
      var comunas = [];
      var names = [];
      if ($scope.useComunas) {
        comunas = d3.range(1, 16);
        for (var i=0; i<comunas.length; i++) {
          names[comunas[i]] = "Comuna " + comunas[i];
        }
      } else {
        for (var j=0; j<$scope.obras.length; j++) {
          if ($scope.obras[j].jurisdiccion && names.indexOf($scope.obras[j].jurisdiccion) === -1) {
            names[$scope.obras[j].comuna] = $scope.obras[j].jurisdiccion;
            comunas.push($scope.obras[j].jurisdiccion_id)
          }
        }
        comunas.sort(function(a, b) {
          if (names[a] > names[b]) return 1;
          if (names[a] < names[b]) return -1;
          return 0;
        })
      }

      var itemH, itemW;
      if ($scope.isSmallDevice) {
        itemH = chart.w;
        itemW = chart.w;
        chart.svg.attr("height", comunas.length * chart.w);
        chart.mainGroup.select("rect").attr("height", comunas.length * chart.w);
      } else {
        itemH = chart.h / Math.ceil((comunas.length / 5));
        itemW = chart.w / 5;
      }

      if (!chart.comunasGroup) {
        chart.comunasGroup = chart.svg.select("#comunas-group");

        chart.comunasGroup
          .selectAll("g.comunas-item")
          .data(comunas)
          .enter()
          .append("g")
          .classed("child", true)
          .classed("comunas-item", true)
          .style("opacity", 0)
          .attr("transform", function(d, i) {
            return (
              "translate(" +
              (chart.w / 2 - itemW / 2) +
              "," +
              (chart.h / 2 - itemH / 2) +
              ")"
            );
          })
          .attr("id", function(d) {
            return "comunas-item-" + d;
          })
          .each(function() {
            var group = d3.select(this);

            group
              .append("rect")
              .classed("comunas-item-frame", true)
              .on("click", clickedComunas);

            group
              .append("text")
              .classed("comunas-item-text", true)
              .attr("fill", "#000")
              .text(function(d) {
                return names[d];
              });
          });
      }

      if (!clear) {
        chart.comunasGroup
          .selectAll("g.comunas-item")
          .style("display", "block");
      }

      //update
      chart.comunasGroup
        .selectAll("rect.comunas-item-frame")
        .transition()
        .duration(700)
        .attr("x", chart.margin)
        .attr("y", chart.margin)
        .attr("height", itemH - chart.margin * 2)
        .attr("width", itemW - chart.margin * 2);

      chart.comunasGroup
        .selectAll("text.comunas-item-text")
        .transition()
        .duration(700)
        .attr("x", 15)
        .attr("y", 25);

      sortItems(
        chart.comunasGroup
          .selectAll("g.comunas-item")
          .transition()
          .duration(1000)
          .style("opacity", 1),
        itemW,
        itemH
      );
    }

    function prepareNodesComunasGroup(comunaID) {
      bubbles.clusters = {};
      bubbles.clusterPoints = {};

      var filterId = comunaID ? comunaID.replace("comunas-item-", "") : false;

      var filtered = $scope.obras.filter(function(d) {
        return (
          !filterId || (filterId && parseInt(d.comuna) === parseInt(filterId))
        );
      });

      var max = Math.ceil(
        d3.max(filtered, function(d) {
          return d[$scope.selectedRadioDimension];
        })
      );
      var min = Math.floor(
        d3.min(filtered, function(d) {
          return d[$scope.selectedRadioDimension];
        })
      );

      bubbles.scale = d3.scale
        .linear()
        .domain([parseInt(min), parseInt(max)])
        .range([10, filterId ? 100 : 50]);

      bubbles.nodes = filtered
        .filter(function(d) {
          return (
            d.comuna &&
            (!filterId ||
              (filterId && parseInt(d.comuna) === parseInt(filterId)))
          );
        })
        .map(function(d) {
          var i = "c" + d.comuna,
            r = filterId ? 10 : 5,
            c = { cluster: i, radius: r ? r : 10, data: d };

          if (!bubbles.clusters[i] || r > bubbles.clusters[i].radius) {
            bubbles.clusters[i] = c;
          }

          return c;
        });

      d3.selectAll("g.comunas-item").each(function(d) {
        var g = d3.select(this);
        var rect = g.select("rect");

        bubbles.clusterPoints["c" + d] = {
          x:
            d3.transform(g.attr("transform")).translate[0] +
            rect.attr("width") / 2,
          y:
            d3.transform(g.attr("transform")).translate[1] +
            rect.attr("height") / 2,
          radius: 20
        };
      });
    }

    var activeComuna = d3.select(null);
    function clickedComunas(d) {
      if (!$scope.isSmallDevice) {
        $scope.closeTooltip();
        if (activeComuna.node() === this) {
          return resetComunas();
        }
        activeComuna.classed("active", false);
        activeComuna = d3.select(this).classed("active", true);

        var selectedG = activeComuna.node().parentNode;

        d3
          .selectAll("g.comunas-item")
          .transition()
          .style("opacity", function() {
            return this === selectedG ? 1.0 : 0;
          })
          .each("end", function() {
            if (this !== selectedG) {
              d3.select(this).style("display", "none");
            }
          });

        activeComuna
          .transition()
          .duration(750)
          .attr("height", chart.h - chart.margin * 2)
          .attr("width", chart.w - chart.margin * 2);

        d3
          .select(selectedG)
          .transition()
          .duration(750)
          .attr("transform", "translate(0,0)")
          .each("end", function() {
            prepareNodesComunasGroup(d3.select(selectedG).attr("id"));
            renderBubbles();
          });
      }
    }

    function resetComunas(clear) {
      activeComuna.classed("active", false);

      activeComuna = d3.select(null);

      d3.selectAll("g.comunas-item").style("display", "block");

      renderComunasGroup(clear);

      if (!clear) {
        setTimeout(function() {
          prepareNodesComunasGroup();
          renderBubbles();
        }, 2000);
      }
    }

    /* MONTOS Functions ====================================================== */

    function renderMontosGroup(clear) {
      var montos = [
        "monto_0_50",
        "monto_50_100",
        "monto_100_150",
        "monto_mas_50"
      ];
      var montos_string = {
        monto_0_50: $scope.i18n.upTo50Millions,
        monto_50_100: $scope.i18n.from50To100Millions,
        monto_100_150: $scope.i18n.from100To150Millions,
        monto_mas_50: $scope.i18n.moreThan150Millions
      };

      var itemH, itemW;
      if ($scope.isSmallDevice) {
        itemH = chart.w;
        itemW = chart.w;
        chart.svg.attr("height", montos.length * chart.w);
        chart.mainGroup.select("rect").attr("height", montos.length * chart.w);
      } else {
        itemH = chart.h / 2;
        itemW = chart.w / 2;
      }

      if (!chart.montosGroup) {
        chart.montosGroup = chart.svg.select("#montos-group");

        chart.montosGroup
          .selectAll("g.montos-item")
          .data(montos)
          .enter()
          .append("g")
          .classed("child", true)
          .classed("montos-item", true)
          .style("opacity", 0)
          .attr("transform", function(d, i) {
            return (
              "translate(" +
              (chart.w / 2 - itemW / 2) +
              "," +
              (chart.h / 2 - itemH / 2) +
              ")"
            );
          })
          .attr("id", function(d) {
            return "montos-item-" + d;
          })
          .each(function() {
            var group = d3.select(this);

            group
              .append("rect")
              .classed("montos-item-frame", true)
              .on("click", clickedMontos);

            group
              .append("text")
              .classed("montos-item-text", true)
              .attr("fill", "#000")
              .text(function(d) {
                return montos_string[d];
              });
          });
      }

      if (!clear) {
        chart.montosGroup.selectAll("g.montos-item").style("display", "block");
      }

      //update
      chart.montosGroup
        .selectAll("rect.montos-item-frame")
        .transition()
        .duration(700)
        .attr("x", chart.margin)
        .attr("y", chart.margin)
        .attr("height", itemH - chart.margin * 2)
        .attr("width", itemW - chart.margin * 2);

      chart.montosGroup
        .selectAll("text.montos-item-text")
        .transition()
        .duration(700)
        .attr("x", 15)
        .attr("y", 25);

      sortItems(
        chart.montosGroup
          .selectAll("g.montos-item")
          .transition()
          .duration(1000)
          .style("opacity", 1),
        itemW,
        itemH
      );
    }

    function prepareNodesMontosGroup(montoID) {
      bubbles.clusters = {};
      bubbles.clusterPoints = {};

      var filterId = montoID ? montoID.replace("montos-item-", "") : false;

      var filtered = $scope.obras.filter(function(d) {
        return (
          d.monto_contrato &&
          d.monto_contrato != "" &&
          (!filterId || (filterId && d.monto_slug === filterId))
        );
      });

      var max = Math.ceil(
        d3.max(filtered, function(d) {
          return d[$scope.selectedRadioDimension];
        })
      );
      var min = Math.floor(
        d3.min(filtered, function(d) {
          return d[$scope.selectedRadioDimension];
        })
      );

      bubbles.scale = d3.scale
        .linear()
        .domain([parseInt(min), parseInt(max)])
        .range([10, filterId ? 100 : 50]);

      bubbles.nodes = filtered.map(function(d) {
        var i = "m-" + d.monto_slug,
          r = filterId ? 10 : 5,
          c = { cluster: i, radius: r ? r : 10, data: d };

        if (!bubbles.clusters[i] || r > bubbles.clusters[i].radius) {
          bubbles.clusters[i] = c;
        }

        return c;
      });

      if (!filterId) {
        d3.selectAll("g.montos-item").each(function(d) {
          var g = d3.select(this);
          var rect = g.select("rect");

          bubbles.clusterPoints["m-" + d] = {
            x:
              d3.transform(g.attr("transform")).translate[0] +
              rect.attr("width") / 2,
            y:
              d3.transform(g.attr("transform")).translate[1] +
              rect.attr("height") / 2,
            radius: 10
          };
        });
      } else {
        bubbles.clusterPoints = false;
      }
    }

    var activeMonto = d3.select(null);

    function resetMontos(clear) {
      activeMonto.classed("active", false);

      activeMonto = d3.select(null);

      d3.selectAll("g.montos-item").style("display", "block");

      renderMontosGroup(clear);

      if (!clear) {
        setTimeout(function() {
          prepareNodesMontosGroup();
          renderBubbles();
        }, 2000);
      }
    }

    function clickedMontos(d) {
      if (!$scope.isSmallDevice) {
        $scope.closeTooltip();
        if (activeMonto.node() === this) {
          return resetMontos();
        }
        activeMonto.classed("active", false);
        activeMonto = d3.select(this).classed("active", true);

        var selectedG = activeMonto.node().parentNode;

        d3
          .selectAll("g.montos-item")
          .transition()
          .style("opacity", function() {
            return this === selectedG ? 1.0 : 0;
          })
          .each("end", function() {
            if (this !== selectedG) {
              d3.select(this).style("display", "none");
            }
          });

        activeMonto
          .transition()
          .duration(750)
          .attr("height", chart.h - chart.margin * 2)
          .attr("width", chart.w - chart.margin * 2);

        d3
          .select(selectedG)
          .transition()
          .duration(750)
          .attr("transform", "translate(0,0)")
          .each("end", function() {
            prepareNodesMontosGroup(d3.select(selectedG).attr("id"));
            renderBubbles();
          });
      }
    }

    /* ETAPAS Functions ====================================================== */

    function renderEtapasGroup(clear) {
      var etapas = [
        "en-proyecto",
        "en-licitacion",
        "en-ejecucion",
        "finalizada"
      ];
      var etapas_string = {
        "en-proyecto": "En Proyecto",
        "en-licitacion": "En Licitación",
        "en-ejecucion": "En Ejecución",
        finalizada: "Finalizada"
      };

      var itemH, itemW;
      if ($scope.isSmallDevice) {
        itemH = chart.w;
        itemW = chart.w;
        chart.svg.attr("height", etapas.length * chart.w);
        chart.mainGroup.select("rect").attr("height", etapas.length * chart.w);
      } else {
        itemH = chart.h / 2;
        itemW = chart.w / 2;
      }

      if (!chart.etapasGroup) {
        chart.etapasGroup = chart.svg.select("#etapas-group");

        chart.etapasGroup
          .selectAll("g.etapas-item")
          .data(etapas)
          .enter()
          .append("g")
          .classed("child", true)
          .classed("etapas-item", true)
          .style("opacity", 0)
          .attr("transform", function(d, i) {
            return (
              "translate(" +
              (chart.w / 2 - itemW / 2) +
              "," +
              (chart.h / 2 - itemH / 2) +
              ")"
            );
          })
          .attr("id", function(d) {
            return "etapas-item-" + d;
          })
          .each(function() {
            var group = d3.select(this);

            group
              .append("rect")
              .classed("etapas-item-frame", true)
              .on("click", clickedEtapas);

            group
              .append("text")
              .classed("etapas-item-text", true)
              .attr("fill", "#000")
              .text(function(d) {
                return etapas_string[d];
              });
          });
      }

      if (!clear) {
        chart.etapasGroup.selectAll("g.etapas-item").style("display", "block");
      }

      //update
      chart.etapasGroup
        .selectAll("rect.etapas-item-frame")
        .transition()
        .duration(700)
        .attr("x", chart.margin)
        .attr("y", chart.margin)
        .attr("height", itemH - chart.margin * 2)
        .attr("width", itemW - chart.margin * 2);

      chart.etapasGroup
        .selectAll("text.etapas-item-text")
        .transition()
        .duration(700)
        .attr("x", 15)
        .attr("y", 25);

      sortItems(
        chart.etapasGroup
          .selectAll("g.etapas-item")
          .transition()
          .duration(1000)
          .style("opacity", 1),
        itemW,
        itemH
      );
    }

    function prepareNodesEtapasGroup(etapaID) {
      bubbles.clusters = {};
      bubbles.clusterPoints = {};

      bubbles.nodesEtapas = [];

      var filterId = etapaID ? etapaID.replace("etapas-item-", "") : false;

      var filtered = $scope.obras.filter(function(d) {
        return (
          d.etapa &&
          d.etapa != "" &&
          (!filterId || (filterId && d.etapa_slug === filterId))
        );
      });

      var max = Math.ceil(
        d3.max(filtered, function(d) {
          return d[$scope.selectedRadioDimension];
        })
      );
      var min = Math.floor(
        d3.min(filtered, function(d) {
          return d[$scope.selectedRadioDimension];
        })
      );

      bubbles.scale = d3.scale
        .linear()
        .domain([parseInt(min), parseInt(max)])
        .range([10, filterId ? 100 : 50]);

      bubbles.nodes = filtered.map(function(d) {
        var i = "e-" + d.etapa_slug,
          r = filterId ? 10 : 5,
          /*r = bubbles.scale(
            d[$scope.selectedRadioDimension]
              ? d[$scope.selectedRadioDimension]
              : 10
          ),*/
          c = { cluster: i, radius: r ? r : 10, data: d };

        if (!bubbles.clusters[i] || r > bubbles.clusters[i].radius) {
          bubbles.clusters[i] = c;
        }

        return c;
      });

      if (!filterId) {
        d3.selectAll("g.etapas-item").each(function(d) {
          var g = d3.select(this);
          var rect = g.select("rect");

          bubbles.clusterPoints["e-" + d] = {
            x:
              d3.transform(g.attr("transform")).translate[0] +
              rect.attr("width") / 2,
            y:
              d3.transform(g.attr("transform")).translate[1] +
              rect.attr("height") / 2,
            radius: 10
          };
        });
      } else {
        bubbles.clusterPoints = false;
      }
    }

    var activeEtapa = d3.select(null);
    function resetEtapas(clear) {
      activeEtapa.classed("active", false);

      activeEtapa = d3.select(null);

      d3.selectAll("g.etapas-item").style("display", "block");

      renderEtapasGroup(clear);

      if (!clear) {
        setTimeout(function() {
          prepareNodesEtapasGroup();
          renderBubbles();
        }, 2000);
      }
    }

    function clickedEtapas(d) {
      if (!$scope.isSmallDevice) {
        $scope.closeTooltip();
        if (activeEtapa.node() === this) {
          return resetEtapas();
        }
        activeEtapa.classed("active", false);
        activeEtapa = d3.select(this).classed("active", true);

        var selectedG = activeEtapa.node().parentNode;

        d3
          .selectAll("g.etapas-item")
          .transition()
          .style("opacity", function() {
            return this === selectedG ? 1.0 : 0;
          })
          .each("end", function() {
            if (this !== selectedG) {
              d3.select(this).style("display", "none");
            }
          });

        activeEtapa
          .transition()
          .duration(750)
          .attr("height", chart.h - chart.margin * 2)
          .attr("width", chart.w - chart.margin * 2);

        d3
          .select(selectedG)
          .transition()
          .duration(750)
          .attr("transform", "translate(0,0)")
          .each("end", function() {
            prepareNodesEtapasGroup(d3.select(selectedG).attr("id"));
            renderBubbles();
          });
      }
    }

    /* Bubble functions ====================================================== */

    function renderLogoTipo(type, svgNode, logoContainer) {
      //use plain Javascript to extract the node
      logoContainer.node().innerHTML = "<div class='circle-bg'></div>";
      logoContainer.node().appendChild(svgNode);
      //d3's selection.node() returns the DOM node, so we
      //can use plain Javascript to append content

      var color = $scope.tipo_colors(type);

      var w = logoContainer
        .select("svg")
        .attr("width")
        .replace("px", "");

      w = w / 2;

      var innerSVG = logoContainer
        .select("svg")
        .attr("height", 50)
        .attr("width", 50);

      logoContainer.select(".circle-bg").style("background-color", color);

      innerSVG.selectAll("path,rect").attr("fill", "#fff");
    }
    $scope.loadedBanderita = false;
    function renderBubbles() {
      if ($scope.selectedGroup != "mapa") {
        bubbles.icons
          .transition()
          .duration(500)
          .attr("opacity", 0);
      }
      bubbles.force = d3.layout
        .force()
        .nodes(bubbles.nodes)
        .size([chart.w, chart.h])
        .gravity(0)
        .charge(function(){
          return $scope.isSmallDevice ? 0 : 1;
        })
        .on("tick", tick)
        .start()
        .on("end", function() {
          if (!$scope.loadedBanderita) {
            bubbles.circles
              .filter(function(d) {
                return d.data.destacada;
              })
              .each(function(d) {
                var x = d.x - 9;
                var y = d.y - 25;
                bubbles.icons
                  .append("g")
                  .attr("class", function(dd) {
                      var red = d.data.red_slug ? "red " + d.data.red_slug : "";
                      var destacada = d.data.destacada ? "destacada " : "";
                      return (
                        "banderita " +
                        " "  +
                        destacada +
                        " " +
                        d.data.tipo_slug +
                        " " +
                        d.data.area_slug +
                        " " +
                        d.data.etapa_slug +
                        " " +
                        red +
                        " " +
                        d.data.nombre.toLowerCase()
                      );
                    })
                  .attr(
                    "transform",
                    "translate(" + x + "," + y + ") scale(0.25)"
                  );
              });
            d3.selectAll("g.banderita").append(function() {
              return compromisoIconSVG.cloneNode(true).documentElement;
            });
            $scope.loadedBanderita = true;
          } else {
            if ($scope.selectedGroup == "mapa") {
              bubbles.icons.attr("opacity", 1);
            }
          }
        });

      bubbles.circles = bubbles.group
        .selectAll("circle.obra")
        .data(bubbles.nodes);

      if (!$scope.isSmallDevice) {
        bubbles.circles
          .enter()
          .append("circle")
          .attr("class", function(d) {
            var red = d.data.red_slug ? "red " + d.data.red_slug : "";
            var destacada = d.data.destacada ? " destacada " : "";
            return (
              "obra " +
              " "  +
              destacada +
              " " +
              d.data.tipo_slug +
              " " +
              d.data.area_slug +
              " " +
              d.data.etapa_slug +
              " " +
              red +
              " " +
              d.data.nombre.toLowerCase()
            );
          })
          .on("mouseenter", function(d) {
            var isVisible = d3.select(this).style("opacity");
            if (isVisible == "1"){


            d.color_tipo_obra = $scope.tipo_colors(d.data.tipo);
            $scope.selectedObra = d;
            $scope.tooltipThumb = d.data.thumb;
            $scope.$apply();

            var logoContainer = d3.select("#tooltip-logo-container");

            if (!$scope.selectedObra.map && window.MDUYT_CONFIG.USE_USIG_MAP_TILES) {
              var url = $sce.getTrustedResourceUrl(
                "https://ws.usig.buenosaires.gob.ar/geocoder/2.2/reversegeocoding?x=" +
                  d.data.lng +
                  "&y=" +
                  d.data.lat
              );
              $http
                .jsonp(url, { jsonpCallbackParam: "callback" })
                .then(function(d) {
                  $scope.selectedObra.map =
                    "http://servicios.usig.buenosaires.gov.ar/LocDir/mapa.phtml?x=" +
                    d.data.puerta_x +
                    "&y=" +
                    d.data.puerta_y +
                    "&h=100&w=300&punto=1&r=50";
                });
            }

            $scope.showObraImg = $scope.selectedObra.map || window.MDUYT_CONFIG.USE_USIG_MAP_TILES;

            if (!logoTipoCache[d.data.tipo_slug]) {
              d3.xml("images/iconos/" + d.data.tipo_slug + ".svg", function(
                error,
                documentFragment
              ) {
                if (error) {
                  console.error(error);
                  return;
                }
                logoTipoCache[
                  d.data.tipo_slug
                ] = documentFragment.getElementsByTagName("svg")[0];
                renderLogoTipo(
                  d.data.tipo,
                  logoTipoCache[d.data.tipo_slug],
                  logoContainer
                );
              });
            } else {
              renderLogoTipo(
                d.data.tipo,
                logoTipoCache[d.data.tipo_slug],
                logoContainer
              );
            }

            var current = d3.select(this);
            chart.selection
              .attr("cx", current.attr("cx"))
              .attr("cy", current.attr("cy"))
              .attr("r", 0)
              .style("stroke", d.color_tipo_obra)
              .transition()
              .duration(500)
              .attr("r", 13)
              .style("opacity", 1);

            var leftvalue =
              chart.w / 2 < d3.event.pageX
                ? d3.event.pageX - 320
                : d3.event.pageX;

            var tooltipH = parseInt(
              $scope.tooltip.style("height").replace("px", "")
            );

            var body = document.body,
              html = document.documentElement;

            var docH = Math.max(
              body.scrollHeight,
              body.offsetHeight,
              html.clientHeight,
              html.scrollHeight,
              html.offsetHeight
            );

            var topValue =
              docH - 600 < d3.event.pageY
                ? d3.event.pageY - tooltipH
                : d3.event.pageY;

            $scope.tooltip
              .style("width", "300px")
              .transition()
              .duration(200)
              .style("top", topValue + "px")
              .style("left", leftvalue + "px")
              .style("opacity", 1);
            }
          })
          .on("mouseout", function(d) {});
      }
      if ($scope.isSmallDevice) {
        bubbles.circles
          .enter()
          .append("circle")
          .attr("class", function(d) {
            var red = d.data.red_slug ? "red " + d.data.red_slug : "";
            var destacada = d.data.destacada ? "destacada " : "";
            return (
              "obra " +
              destacada +
              " " +
              d.data.tipo_slug +
              " " +
              d.data.area_slug +
              " " +
              d.data.etapa_slug +
              " " +
              red +
              " " +
              d.data.nombre.toLowerCase()
            );
          })
          .on("click", function(d) {
            d.color_tipo_obra = $scope.tipo_colors(d.data.tipo);
            $scope.selectedObra = d;
            $scope.tooltipThumb = false;
            if (!$scope.selectedObra.map) {
              var url = $sce.getTrustedResourceUrl(
                "https://ws.usig.buenosaires.gob.ar/geocoder/2.2/reversegeocoding?x=" +
                  d.data.lng +
                  "&y=" +
                  d.data.lat
              );
              $http
                .jsonp(url, { jsonpCallbackParam: "callback" })
                .then(function(d) {
                  $scope.selectedObra.map =
                    "http://servicios.usig.buenosaires.gov.ar/LocDir/mapa.phtml?x=" +
                    d.data.puerta_x +
                    "&y=" +
                    d.data.puerta_y +
                    "&h=100&w=300&punto=1&r=50";
                });
            }

            var logoContainer = d3.select("#tooltip-logo-container");
            if (!logoTipoCache[d.data.tipo_slug]) {
              d3.xml("images/iconos/" + d.data.tipo_slug + ".svg", function(
                error,
                documentFragment
              ) {
                if (error) {
                  console.error(error);
                  return;
                }
                logoTipoCache[
                  d.data.tipo_slug
                ] = documentFragment.getElementsByTagName("svg")[0];
                renderLogoTipo(
                  d.data.tipo,
                  logoTipoCache[d.data.tipo_slug],
                  logoContainer
                );
              });
            } else {
              renderLogoTipo(
                d.data.tipo,
                logoTipoCache[d.data.tipo_slug],
                logoContainer
              );
            }

            d3.selectAll("circle.obra").style("opacity", 0.3);
            d3.select(this).style("opacity", 1);
            $scope.tooltip
              .style("width", chart.w - 20 + "px")
              .transition()
              .duration(200)
              .style("left", "10px")
              .style("top", d3.event.pageY + "px")
              .style("opacity", 1);
            $scope.$apply();
          });
      }

      bubbles.circles
        .attr("id", function(d) {
          return "e" + d.data.id;
        })
        .attr("class", function(d) {
            var red = d.data.red_slug ? "red " + d.data.red_slug : "";
             var destacada = d.data.destacada ? "destacada " : "";
            return (
              "obra " +
              destacada +
              " " +
              d.data.tipo_slug +
              " " +
              d.data.area_slug +
              " " +
              d.data.etapa_slug +
              " " +
              red +
              " " +
              d.data.nombre.toLowerCase()

            );
          })
        .style("fill", function(d) {
          return $scope.tipo_colors(d.data.tipo);
        });

      bubbles.circles
        .transition()
        .style("opacity", 1)
        .attr("r", function(d) {
          return d.radius;
        });

      bubbles.circles.exit().remove();
      $scope.filterBubbles($scope.selectedFilter);
    }

    function tick(e) {
      bubbles.circles
        .each(cluster(10 * e.alpha * e.alpha))
        .each(collide(0.2))
        .attr("cx", function(d) {
          return d.x;
        })
        .attr("cy", function(d) {
          return d.y;
        });
    }

    // Move d to be adjacent to the cluster node.
    function cluster(alpha) {
      return function(d) {
        var cluster = bubbles.clusters[d.cluster];
        var k = 1;

        if (cluster) {
          // For cluster nodes, apply custom gravity.
          if (cluster === d) {
            if (bubbles.clusterPoints) {
              cluster = bubbles.clusterPoints[d.cluster];

              cluster = {
                x: cluster.x,
                y: cluster.y,
                radius: -cluster.radius
              };
              k = 5 * Math.sqrt(d.radius);
            } else {
              cluster = {
                x: chart.w / 2,
                y: chart.h / 2,
                radius: -d.radius
              };
              k = Math.sqrt(d.radius);
            }
          }

          var x = d.x - cluster.x,
            y = d.y - cluster.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + cluster.radius;

          if (l !== r) {
            l = (l - r) / l * alpha * k;
            d.x -= x *= l;
            d.y -= y *= l;
            cluster.x += x;
            cluster.y += y;
          }
        }
      };
    }

    // Resolves collisions between d and all other circles.
    function collide(alpha) {
      var quadtree = d3.geom.quadtree(bubbles.nodes);
      return function(d) {
        var r = d.radius + 2,
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
        quadtree.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && quad.point !== d) {
            var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + quad.point.radius + 2;
            if (l < r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }

    $scope.closeTooltip = function() {
      chart.selection
        .transition()
        .duration(200)
        .attr("r", 0)
        .style("opacity", 0);
      $scope.tooltip
        .transition()
        .duration(200)
        .style("top", "-500px")
        .style("opacity", 0);
    };


    $scope.closeList = function(){

      $scope.showList = false;
      $scope.filteredObras = [];
      $scope.selectedComuna = "";

    }
  });
