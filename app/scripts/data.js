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

var jurisdiccionesIds = {};
var jurisdiccionesCounter = 1;

var cleanData = function(oldReg, index, Slug) {
  var reg = {};
  for (var key in oldReg) {
    if (oldReg.hasOwnProperty(key)) {
      reg[key.toLowerCase()] = oldReg[key];
    }
  }

  reg.compromiso = reg.compromiso == "SI" ? true : false;

  if (reg.jurisdiccion && reg.jurisdiccion.toString().trim().length) {
    if (!jurisdiccionesIds[reg.jurisdiccion]) {
      jurisdiccionesIds[reg.jurisdiccion] = jurisdiccionesCounter;
      jurisdiccionesCounter += 1;
    }
    reg.jurisdiccion_id = jurisdiccionesIds[reg.jurisdiccion];
  }

  //arrays
  //reg.tipo = (reg.tipo)?reg.tipo.split('|'):[];
  var comunas = reg.comuna ? reg.comuna.split("|") : [null];
  reg.comuna = comunas[0];
  reg.comuna = reg.comuna ? parseInt(reg.comuna.toString().trim()) : reg.comuna;
  if (!reg.comuna) {
    reg.comuna_from_jurisdiccion = true;
    reg.comuna = reg.jurisdiccion_id;
  }
  reg.barrio = reg.barrio ? reg.barrio.split("|") : [];
  reg.licitacion_oferta_empresa = reg.licitacion_oferta_empresa
    ? reg.licitacion_oferta_empresa
    : null;

  reg.mano_obra = reg.mano_obra ? parseInt(reg.mano_obra) : null;

  //numbers
  reg.id = parseInt(reg.id || index);
  reg.licitacion_anio = reg.licitacion_anio
    ? parseInt(reg.licitacion_anio.toString().trim())
    : null;
  reg.monto_contrato = reg.monto_contrato
    ? parseFloat(reg.monto_contrato.toString().replace(/[$]+/g,"").trim())
    : null;
  reg.licitacion_presupuesto_oficial = reg.licitacion_presupuesto_oficial
    ? parseFloat(reg.licitacion_presupuesto_oficial.toString().trim())
    : null;
  reg.plazo_meses = reg.plazo_meses
    ? parseInt(reg.plazo_meses.toString().trim())
    : null;
  reg.porcentaje_avance = reg.porcentaje_avance
    ? reg.porcentaje_avance.toString().trim()
    : "";
  reg.porcentaje_avance.toString().trim();
  reg.porcentaje_avance = isNaN(reg.porcentaje_avance)
    ? ""
    : reg.porcentaje_avance;
  reg.porcentaje_avance = reg.porcentaje_avance
    ? parseFloat(reg.porcentaje_avance)
    : null;

  reg.porcentaje_avance =
    reg.etapa === "Finalizada" ? 100 : reg.porcentaje_avance;

  reg.hideDates =
    reg.etapa === "En proyecto" || reg.etapa === "En licitación" || !reg.fecha_inicio || !reg.fecha_fin_inicial;

  reg.fotos = [];
  for (var i = 1; i <= 4; i++) {
    var key = "imagen_" + i;
    if (reg[key]) {
      reg.fotos[i - 1] = reg[key];
    }
  }

  reg.thumb = reg.fotos[0] || '';

  //slug
  reg.entorno_slug = reg.entorno ? Slug.slugify(reg.entorno.toString().trim()) : null;

  reg.etapa_slug = reg.etapa ? Slug.slugify(reg.etapa.toString().trim()) : null;

  reg.tipo_slug = reg.tipo ? Slug.slugify(reg.tipo.toString().trim()) : null;

  reg.entorno = (reg.entorno)?reg.entorno:null;

  reg.area_slug = reg.area_responsable
    ? Slug.slugify(reg.area_responsable.toString().trim())
    : null;

  reg.red_slug = reg.red ? Slug.slugify(reg.red.toString().trim()) : null;

  reg.monto_slug = reg.monto_contrato
    ? getMontoRange(reg.monto_contrato)
    : null;

  reg.hasDetail = !!(reg.etapa || reg.etapa_detalle || reg.tipo || reg.area_responsable || reg.licitacion_oferta_empresa
    || reg.porcentaje_avance || reg.plazo_meses || reg.licitacion_anio || reg.beneficiarios || reg.mano_obra
    || reg.monto_contrato || reg.licitacion_presupuesto_oficial || reg.pliego_descarga);
  return reg;
};


function loadData ($sce, $q, $http, Slug) {
  if(!window.MDUYT_CONFIG){
    throw 'Archivo de configuración inexistente';
  }

  var deferred = $q.defer();
  var data;

  var onSuccess = function (result) {
    if (window.MDUYT_CONFIG.LOAD_USING_JSONP) {
      data = result.data;
    } else if (window.MDUYT_CONFIG.DATA_ORIGIN === 'andino-json-api') {
      data = result.data.result.records;
    } else {
      data = Papa.parse(result.data, { header:true }).data;
    }
    data = data.map(function (reg, index) { return cleanData(reg, index, Slug)});
    deferred.resolve(data);
  };

  var onError = function(error) {
    data = error;
    deferred.reject(error);
  };

  var trustedUrl = $sce.trustAsResourceUrl(window.MDUYT_CONFIG.DATA_PATH);
  if (window.MDUYT_CONFIG.LOAD_USING_JSONP) {
    $http.jsonp(trustedUrl).then(onSuccess, onError);
  } else {
    $http.get(trustedUrl).then(onSuccess, onError);
  }

  return deferred.promise;
}
