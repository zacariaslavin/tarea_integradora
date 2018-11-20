"use strict";

angular
  .module("obrasMduytApp")
  .controller("BuscadorCtrl", function(
    $scope,
    DataService,
    $routeParams,
    NgTableParams,
    $filter,
    $sce,
    ngTableEventsChannel
  ) {
    $scope.i18n = window._i18n;

    $scope.loading = true;

    $scope.pymChild = new window.pym.Child({ polling: 1000 });
    $scope.pymChild.sendHeight();

    $scope.montos_string = {
      monto_0_50: $scope.i18n.upTo50Millions,
      monto_50_100: $scope.i18n.from50To100Millions,
      monto_100_150: $scope.i18n.from100To150Millions,
      monto_mas_50: $scope.i18n.moreThan150Millions
    };

    DataService.getAll().then(function(data) {
      //console.log(data);
      //$scope.obras = data;

      var selects = {
        comunas: d3
          .keys(
            d3
              .nest()
              .key(function(d) {
                return d.comuna;
              })
              .map(
                data.filter(function(d) {
                  return d.comuna !== null;
                })
              )
          )
          .map(function(c) {
            return { id: c.trim(), title: "Comuna " + c };
          }),
        etapas: d3
          .keys(
            d3
              .nest()
              .key(function(d) {
                return d.etapa;
              })
              .map(data)
          )
          .map(function(e) {
            return { id: e, title: e };
          }),
        tipos: d3
          .keys(
            d3
              .nest()
              .key(function(d) {
                return d.tipo;
              })
              .map(data)
          )
          .map(function(e) {
            return { id: e, title: e };
          }),
        montos: d3
          .keys(
            d3
              .nest()
              .key(function(d) {
                return d.monto_slug;
              })
              .map(
                data.filter(function(d) {
                  return d.monto_slug;
                })
              )
          )
          .map(function(e) {
            return { id: e, title: $scope.montos_string[e] };
          }),
        areas: d3
          .keys(
            d3
              .nest()
              .key(function(d) {
                return d.area_responsable;
              })
              .map(
                data.filter(function(d) {
                  return d.area_responsable;
                })
              )
          )
          .map(function(e) {
            return { id: e, title: e };
          })
      };

      selects.comunas.unshift({ id: "", title: $scope.i18n.all });
      selects.etapas.unshift({ id: "", title: $scope.i18n.all });
      selects.areas.unshift({ id: "", title: $scope.i18n.all });
      selects.tipos.unshift({ id: "", title: $scope.i18n.all });
      selects.montos.unshift({ id: "", title: $scope.i18n.all });

      function renderNormalValue($scope, row) {
        return row[this.field];
      }

      function renderMoneyValue($scope, row) {
        var value = "-";
        if (row[this.field]) {
          var value = $filter("currency")(row[this.field], "$", 0).replace(
            /\,/g,
            "."
          );
        }
        return $sce.trustAsHtml('<p class="text-right">' + value + "</p>");
      }

      function renderLinkValue($scope, row) {
        var value = row[this.field];
        var html = "";
        if (value && value != "") {
          html =
            "<a href='" +
            value +
            "' class='btn btn-default btn-xs btn-block' target='_blank'>Más información</a>";
        }
        return $sce.trustAsHtml(html);
      }

      $scope.cols = [];

      var dataHasAttribute = function (attr) {
        return _.some(data, function(d) { return d[attr] })
      };

      if (dataHasAttribute('comuna')) {
        $scope.cols.push({
          field: "comuna",
          title: "Comuna",
          filter: { comuna: "select" },
          filterData: selects.comunas,
          show: true,
          /*sortable: "comuna",*/
          getValue: renderNormalValue
        });
      }

      $scope.cols.push({
          field: "nombre",
          title: "Nombre",
          filter: { nombre: "text" },
          show: true,
          class: "lupita",
          /*sortable: "nombre",*/
          getValue: renderNormalValue
      });

      if (dataHasAttribute('area_responsable')) {
        $scope.cols.push({
          field: "area_responsable",
          title: "Área Responsable",
          filter: { area_responsable: "select" },
          filterData: selects.areas,
          show: true,
          /*sortable: "area_responsable",*/
          getValue: renderNormalValue
        });
      }

      if (dataHasAttribute('etapa')) {
        $scope.cols.push({
          field: "etapa",
          title: "Etapa",
          filter: { etapa: "select" },
          filterData: selects.etapas,
          show: true,
          /*sortable: "etapa",*/
          getValue: renderNormalValue
        });
      }

      if (dataHasAttribute("tipo")) {
        $scope.cols.push({
          field: "tipo",
          title: "Tipo",
          filter: { tipo: "select" },
          filterData: selects.tipos,
          show: true,
          /*sortable: "monto_contrato",*/
          getValue: renderNormalValue
        });
      }

      if (dataHasAttribute("monto_slug")) {
        $scope.cols.push({
          field: "monto_slug",
          title: "Monto Inversión",
          filter: { monto_slug: "select" },
          filterData: selects.montos,
          show: true,
          /*sortable: "monto_contrato",*/
          getValue: renderNormalValue
        });
      }

      if (dataHasAttribute("link_interno")) {
        $scope.cols.push({
          field: "link_interno",
          title: "",
          filter: false,
          show: true,
          /*sortable: false,*/
          getValue: renderLinkValue
        });
      }

      if (dataHasAttribute("licitacion_oferta_empresa")) {
        $scope.cols.push({
          field: "licitacion_oferta_empresa",
          title: "Empresa",
          filter: { licitacion_oferta_empresa: "text" },
          show: true,
          class: "lupita",
          /*sortable: "licitacion_empresa",*/
          getValue: renderNormalValue
        });
      }

      /*function onPagesChanged(d){
          $scope.results = d.data;
          console.log('pages change',d.count());
        }

        function onDatasetChanged(d){
          $scope.results = d.data;
          console.log('dataset change',d.count());
        }*/

      function onAfterReloadData(d) {
        $scope.results = d.data;
        //console.log('reload data',d.count());
      }

      function onAfterCreated() {
        $('[ng-table-pagination="params"]').appendTo("#footer");
      }

      ngTableEventsChannel.onAfterCreated(onAfterCreated, $scope);
      //ngTableEventsChannel.onPagesChanged(onPagesChanged, $scope);
      //ngTableEventsChannel.onDatasetChanged(onDatasetChanged, $scope);
      ngTableEventsChannel.onAfterReloadData(onAfterReloadData, $scope);

      $scope.tableParams = new NgTableParams(
        {
          sorting: { comuna: "asc" },
          filter: {
            comuna: "",
            etapa: "",
            tipo: "",
            monto_slug: "",
            area_responsable: ""
          },
          page: 1,
          count: 10
        },
        {
          dataset: data,
          counts: [10, 25, 50]
        }
      );

      var showCols = {
        lg: [
          "comuna",
          "nombre",
          "area_responsable",
          "licitacion_empresa",
          "etapa",
          "monto_contrato",
          "link_interno"
        ],
        md: [
          "comuna",
          "nombre",
          "area_responsable",
          "licitacion_empresa",
          "etapa",
          "monto_contrato",
          "link_interno"
        ],
        sm: ["comuna", "nombre", "etapa", "monto_contrato", "link_interno"],
        xs: ["nombre", "etapa", "monto_contrato", "link_interno"]
      };

      function toggleColums(size) {
        $scope.cols.forEach(function(c) {
          if (showCols[size].indexOf(c.field) > -1) {
            c.show = true;
          } else {
            c.show = false;
          }
        });
        $scope.$apply();
      }

      function checkColumns() {
        var w = d3
          .select("#buscador-table")
          .node()
          .getBoundingClientRect().width;

        if (w > 700) {
          toggleColums("lg");
        } else if (w <= 700 && w > 650) {
          toggleColums("md");
        } else if (w <= 650 && w > 600) {
          toggleColums("sm");
        } else if (w <= 600) {
          toggleColums("xs");
        }
      }

      $scope.loading = false;

      //hide columns on resize
      $scope.timeoutId;
      window.$(window).resize(function() {
        clearTimeout($scope.timeoutId);
        $scope.timeoutId = setTimeout(function() {
          //checkColumns()
        }, 1000);
      });
    });
  });
