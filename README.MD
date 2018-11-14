# [BA Obras](https://obras.buenosaires.gob.ar/)

Proyecto de visualización y análisis de la información de las obras del Gobierno de la Ciudad de Buenos Aires.

  - [Acerca de BA Obras](#acerca-de-ba-obras)
  - [Requisitos de datos](#requisitos-de-datos)
    - [Esquema de datos](#esquema-de-datos)
  - [Archivos necesarios para el correcto funcionamiento del sitio](#archivos-necesarios-para-el-correcto-funcionamiento-del-sitio)
    - [Archivos geoespaciales](#archivos-geoespaciales)
    - [Favicon](#favicon)
  - [Instrucciones para desarrolladores](#instrucciones-para-desarrolladores)
    - [Adaptación estetica](#adaptaci%C3%B3n-estetica)
  - [Levantar el proyecto en un ambiente productivo](#levantar-el-proyecto-en-un-ambiente-productivo)
    - [Requerimientos](#requerimientos)
    - [Configuración](#configuraci%C3%B3n)
    - [Instalación por primera vez](#instalaci%C3%B3n-por-primera-vez)
    - [Actualizaciones](#actualizaciones)
  - [Archivo de Configuración](#archivo-de-configuraci%C3%B3n)

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

| Nombre de la columna          | Columna obligatoria / opcional | Tipo de dato      | Detalle                                              |
| ----------------------------- |------------------------------- | ----------------- | ---------------------------------------------------- |
| `nombre`                      | Obligatoria                    | Texto             | Nombre con el cual se identifica a la obra           |
| `lat`                         | Obligatoria                    | Numerico¹         | Latittud de la ubicación de la obra                  |
| `lng`                         | Obligatoria                    | Numerico¹         | Longitud de la ubicación de la obra                  |
| `imagen_1`                    | Obligatoria                    | Url               | Url de una imagen representando la obra              |
| `descripcion`                 | Obligatoria                    | Texto             | Descripción la obra                                  |
| `entorno`                     | Obligatoria                    | Categoria (Texto) | Clasificación territorial de la obra                 |
| `monto_contrato`              | Obligatoria                    | Numerico¹         | Monto presupuestado para la obra                     |
| `etapa`                       | Obligatoria                    | Categoria (Texto). Uno de los siguientes valores: `En proyecto`, `En licitacion`, `En ejecucion`, `Finalizada` | Etapa de la obra |
| `tipo`                        | Obligatoria                    | Categoria (Texto) | Tipo de la obra. Los valores deben coincidir con la nomenclatura actual o, en caso contrario, deben cargarse nuevos iconos al proyecto² |
| `mano_obra`                   | Opcional                       | Numerico¹         | Cantidad de obreros trabajando en la obra            |
| `porcentaje_avance`           | Opcional                       | Numerico¹         | Porcentaje de avance entre 0 y 100                   |
| `id`                          | Opcional                       | Numerico¹         | Identificador de la obra                             |
| `etapa_detalle`               | Opcional                       | Texto             | Información extra de la etapa                        |
| `area_responsable`            | Opcional                       | Categoria (Texto) | Ministerio o área responsable                        |
| `comuna`                      | Opcional                       | Numerico¹         | Número de la comuna                                  |
| `barrio`                      | Opcional                       | Texto             | Nombre del barrio                                    |
| `calle_1`                     | Opcional                       | Texto             | Calle                                                |
| `seccion`                     | Opcional                       | Numerico¹         | Número de sección                                    |
| `manzana`                     | Opcional                       | Numerico¹         | Número de manzana                                    |
| `parcela`                     | Opcional                       | Numerico¹         | Número de parcela                                    |
| `direccion`                   | Opcional                       | Texto             | Dirección y número                                   |
| `fecha_inicio`                | Opcional                       | Fecha             | Fecha de inicio de la obra                           |
| `fecha_fin_inicial`           | Opcional                       | Fecha             | Fecha de fin de la obra                              |
| `plazo_meses`                 | Opcional                       | Numerico¹         | Cantidad de meses                                    |
| `imagen_2`                    | Opcional                       | Url               | Url de una imagen secundaria representando la obra   |
| `imagen_3`                    | Opcional                       | Url               | Url de una imagen secundaria representando la obra   |
| `imagen_4`                    | Opcional                       | Url               | Url de una imagen secundaria representando la obra   |
| `licitacion_oferta_empresa`   | Opcional                       | Texto             | Nombre de la empresa                                 |
| `licitacion_anio`             | Opcional                       | Numerico¹         | Año de la licitación                                 |
| `benficiarios`                | Opcional                       | Numerico¹         | Cantidad de beneficiarios                            |
| `compromiso`                  | Opcional                       | Texto             | Nombre del compromiso                                |
| `link_interno`                | Opcional                       | Url               | Link para mas información sobre la obra              |
| `pliego_descarga`             | Opcional                       | Url               | Link absoluto al pliego de la obra                   |

¹ Tener en cuenta que es importante formatear los numeros de forma tal que el separador decimal sea `.` y no deben 
contar con separadores de miles, comillas, caracter de moneda, ni otros caracteres especiales. 

² Los tipos de obras que actualmente cuentan con iconos son: `Arquitectura`, `Escuelas`, `Espacio publico`, 
`Hidraulica e infraestructura`, `Hidraulica`, `Salud`, `Transporte` y `Vivienda`. En caso de contar con tipos de obras
que no se encuentren entre las anteriores, es necesario agregar los iconos correspondientes a la carpeta 
`app/images/iconos`. Los nombres de archivo deben estar en formato `svg` y su nombre debe estar en minuscula y 
reemplazando los espacios por guiones `-`, por ej: el icono correspondiente a `Espacio publico` tiene nombre de 
archivo `espacio-publico.svg`. Luego de agregar los iconos, es necesario buildear el proyecto (ver instrucciones para
desarrolladores en este mismo documento).

## Archivos necesarios para el correcto funcionamiento del sitio

### Archivos geoespaciales

TODO: hablar del geojson necesario y su estructura

### Favicon

Para modificar el favicon del sitio, pisar el archivo `app/favicon.ico` con el favicon que se quiera utilizar.
Es necesario buildear el proyecto luego de este cambio. Ver la siguiente seccion.

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

### Adaptación estetica

En caso de necesitar agregar cambios al css del sitio, ubicarlos en el archivo `app/styles/custom.css`. Este archivo
tiene precedencia por sobre los estilos base del sitio. 

Una vez modificado este archivo, ejecutar el comando `grunt build` para empaquetar los cambios y disponibilizarlos
en la carpeta `dist` con el resto de los assets productivos.


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

| Config                | Valor                 | Descripción                                                                                                           |
| --------------------- |---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `LOAD_USING_JSONP`    | `true\|false`         | Indica si el archivo de datos deberá ser cargado utilizando un request via jsonp o si deberá ser cargado localmente.  |
| `DATA_PATH`           | String                | Url o nombre de archivo                                                                                               |
| `USE_USIG_MAP_TILES`  | `true\|false`         | Indica si los mapas deberan usar tilemaps de USIG (soporte unicamente para Buenos Aires)                              |
| `CITY_NAME`           | String                | Nombre de la jurisdicción correspondiente al sitio                                                                    |
