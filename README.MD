# [BA Obras](https://obras.buenosaires.gob.ar/)

Proyecto de visualización y análisis de la información de las obras del Gobierno de la Ciudad de Buenos Aires.

- [Instrucciones para desarrolladores](./docs/es/DEVELOP.md)
- [Actualizaciones](./docs/es/UPDATES.md) 
- [Changelog](./docs/es/CHANGELOG.md)


## Acerca de BA Obras 

BA Obras es un sitio web que busca informar a la ciudadanía acerca del avance de todas las obras de la jurisdicción.
El sistema es una aplicación frontend que toma información de un csv y crea visualizaciones de datos sobre el 
cumplimiento de las obras. Se genera una vista para cada obra y una vista general donde pueden verse todas. 
La misma tiene la capacidad de ser embebida dentro otras páginas correspondientes a organismos relacionados.

El proyecto original puede verse en [obras.buenosaires.gob.ar](https://obras.buenosaires.gob.ar/)

Se trata de una aplicación enteramente de frontend (todos archivos estáticos), con diferentes vistas. 
El proyecto es exclusivamente frontend. Todos los datos son obtenidos desde un unico CSV estáticos y los representa. 
No tiene formularios, submits a backend con información ni acceso a base de datos.
Está construído como Single Page Application basado en Angular JS.

## Requisitos de datos

La fuente de datos del sitio consta de un archivo csv que puede estar alojado en un servicio externo o puede ser 
un archivo que forme parte del proyecto. Para conocer detalles sobre la conexion entre el sitio y el csv, ver 
la sección relativa al archivo de configuración.

### Esquema de datos

| Nombre de la columna  | Columna obligatoria / opcional | Tipo de dato | Detalle                                    |
| --------------------- |------------------------------- | ------------ | ------------------------------------------ |
| `nombre`              | Obligatoria                    | Texto        | Nombre con el cual se identifica a la obra |


## Instrucciones para desarrolladores

Para realizar modificaciones al sitio actual, realizar los siguientes pasos

* Clonar el proyecto usando git
* Instalar NodeJS. Recomendamos usar [nvm](https://github.com/creationix/nvm). Una vez instalado `nvm` ejecutar 
`nvm use` en la carpeta raiz del proyecto para asegurarse de usar la misma version de node.
* Instalar las dependencias de npm via `npm install` en la carpeta raiz del proyecto 
* Instalar las dependencias de bower via `bower install` en la carpeta raiz del proyecto
* Archivo de configuración: En /app duplicar el archivo config.js.example con el nombre config.js y configurar 
acorde a la [seccion correspondiente al archivo de configuración](./CONFIG.md)
* Levantar el servidor de desarrollo via `grunt serve` en la carpeta raiz del proyecto
* Hacer los cambios en /app y con live reloading se actualizará en http://localhost:10000
* Una vez que se cuenta con los cambios deseados, compilar assets via `grunt build` en la carpeta raiz del proyecto


## Levantar el proyecto en un ambiente productivo

### Requerimientos

Sólo requiere un servidor web que pueda servir los contenidos. 
La aplicación contiene su código y las librerías que necesita, ya compiladas en la carpeta `/dist`.

* Apache o NGINX
* Varnish u otro caché de estáticos (opcional, ideal para mejorar la performance)
* No se requiere hacer build de ningún tipo.
* No se requiere salida a internet desde el servidor.
* No se requieren instalación de dependencias.
* Todo lo necesario está compilado y minificado en estáticos (html, css, js e imágenes), dentro de la carpeta `/dist`.

### Configuración

* La única configuración requerida es la creación del ARCHIVO de configuración y al archivo `csv` de datos 
(en caso de no cargarlo via un servicio externo)
* No requiere parámetros de ambiente del servidor, ni de proceso. Es todo web y js client – side.

### Instalación por primera vez

1. Crear un subdominio o definir la url donde vivirá la aplicación, podría ser: 
`https://obras-site.buenosaires.gob.ar/`.
2. Definir un servidor con nginx o apache y clonar el proyecto usando 
`git clone https://github.com/datosgcba/ba_obras.git`.
3. Apuntar las configuraciones del web server y subdominio a la carpeta `dist`, donde se encuentran los archivos 
finales y compilados.

### Actualizaciones

En caso de querer actualizar a un tag especifico, ubicarse en la carpeta raíz del proyecto, dentro del servidor y 
ejecutar el pull al tag de la versión indicada via `git fetch --tags` y luego `git checkout TAG-DE-VERSION`.

En caso de querer actualizar a la ultima version disponible, ubicarse en la carpeta raiz del proyecto y ejecutar
`git pull`.

En ambos casos, la carpeta `dist` quedara con sus archivos actualizados. Si se han realizados cambios al proyecto
utilizando versionado via git, mergearlos a la correspondiente nueva version.


## Archivo de Configuración

El archivo de configuración `config.js` deberá configurarse acordemente para poder levantar el sitio en modo de
desarrollo o producción. Existen dos ejemplos del archivo de configuración `config.js.example` en las carpetas `app`
y `dist` para servir de base al archivo de configuración de desarrollo `app/config.js` y al archivo de configuración
de producción `dist/config.js`

| Config                | Valor               | Descripción                                                          |
| --------------------- |-------------------- | -------------------------------------------------------------------- |
| `LOAD_USING_JSONP`    | `true\|false`        | Indica si el archivo de datos deberá ser cargado utilizando un request via jsonp o si deberá ser cargado localmente. |


3. Modificar este nuevo archivo con los datos correspondientes:
  3. BASE_URL: será la url del conector de la API ( utilizar `https://compromisos-csv.buenosaires.gob.ar/` ).
  3. HOME_CSV: url absoluta del archivo csv que alimenta la home, el buscador y las internas. (Si no se tiene aún, dejar los de ejemplo o utilizar la disponible para producción `https://recursos-data.buenosaires.gob.ar/ckan2/observatorio-obras-publicas/observatorio-obras_original.csv` 
