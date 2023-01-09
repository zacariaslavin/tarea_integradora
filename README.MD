# [Obras Abiertas](https://obras.buenosaires.gob.ar/)

[![Build Status](https://travis-ci.com/datosgcba/ba_obras.svg?branch=master)](https://travis-ci.com/datosgcba/ba_obras)

[English documentation](./README_en.MD)

Proyecto de visualización y análisis de la información de las obras públicas basada en la iniciativa [BA Obras](https://obras.buenosaires.gob.ar/) del Gobierno de la Ciudad de Buenos Aires.

  - [Acerca de Obras Abiertas](#acerca-de-obras-abiertas)
  - [Requisitos de datos](#requisitos-de-datos)
    - [Esquema de datos](#esquema-de-datos)
  - [Archivos necesarios para el correcto funcionamiento del sitio](#archivos-necesarios-para-el-correcto-funcionamiento-del-sitio)
    - [Archivos geoespaciales](#archivos-geoespaciales)
    - [Imagenes del sitio](#imagenes-del-sitio)
    - [Imagenes de obras](#imagenes-de-obras)
  - [Instrucciones para desarrolladores](#instrucciones-para-desarrolladores)
    - [Adaptación estetica](#adaptaci%C3%B3n-estetica)
  - [Levantar el proyecto en un ambiente productivo](#levantar-el-proyecto-en-un-ambiente-productivo)
    - [Requerimientos](#requerimientos)
    - [Configuración](#configuraci%C3%B3n)
    - [Instalación por primera vez](#instalaci%C3%B3n-por-primera-vez)
    - [Actualizaciones](#actualizaciones)
  - [Archivo de Configuración](#archivo-de-configuraci%C3%B3n)
    - [i18n](#i18n)

## Acerca de Obras Abiertas 

Obras Abiertas es un sitio web que busca informar a la ciudadanía acerca del avance de todas las obras de la jurisdicción.
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
| `descripcion`                 | Obligatoria                    | Texto             | Descripción la obra                                  |
| `entorno`                     | Obligatoria                    | Categoria (Texto) | Clasificación territorial de la obra                 |
| `monto_contrato`              | Obligatoria                    | Numerico¹         | Monto presupuestado para la obra                     |
| `etapa`                       | Obligatoria                    | Categoria (Texto). Uno de los siguientes valores: `En proyecto`, `En licitacion`, `En ejecucion`, `Finalizada` | Etapa de la obra |
| `tipo`                        | Obligatoria                    | Categoria (Texto) | Tipo de la obra. Los valores deben coincidir con la nomenclatura actual o, en caso contrario, deben cargarse nuevos iconos al proyecto² |
| `comuna`                      | Opcional³                      | Numerico¹         | Número de la comuna                                  |
| `jurisdiccion`                | Opcional³                      | Categoria (Texto) | Jurisdicción a la cual pertenece la obra             |
| `mano_obra`                   | Opcional                       | Numerico¹         | Cantidad de obreros trabajando en la obra            |
| `porcentaje_avance`           | Opcional                       | Numerico¹         | Porcentaje de avance entre 0 y 100                   |
| `id`                          | Opcional                       | Numerico¹         | Identificador de la obra                             |
| `etapa_detalle`               | Opcional                       | Texto             | Información extra de la etapa                        |
| `area_responsable`            | Opcional                       | Categoria (Texto) | Ministerio o área responsable                        |
| `barrio`                      | Opcional                       | Texto             | Nombre del barrio                                    |
| `calle_1`                     | Opcional                       | Texto             | Calle                                                |
| `seccion`                     | Opcional                       | Numerico¹         | Número de sección                                    |
| `manzana`                     | Opcional                       | Numerico¹         | Número de manzana                                    |
| `parcela`                     | Opcional                       | Numerico¹         | Número de parcela                                    |
| `direccion`                   | Opcional                       | Texto             | Dirección y número                                   |
| `fecha_inicio`                | Opcional                       | Fecha             | Fecha de inicio de la obra                           |
| `fecha_fin_inicial`           | Opcional                       | Fecha             | Fecha de fin de la obra                              |
| `plazo_meses`                 | Opcional                       | Numerico¹         | Cantidad de meses                                    |
| `imagen_1`                    | Opcional                       | Url⁴              | Url de una imagen representando la obra              |
| `imagen_2`                    | Opcional                       | Url⁴              | Url de una imagen secundaria representando la obra   |
| `imagen_3`                    | Opcional                       | Url⁴              | Url de una imagen secundaria representando la obra   |
| `imagen_4`                    | Opcional                       | Url⁴              | Url de una imagen secundaria representando la obra   |
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

³ Si bien las columnas de `comuna` y `jurisdiccion` se presentan como opcionales, es requisito que una de las dos
columnas esté presente.

⁴ En caso de no contar con urls para las imagenes, es posible incorporarlas cómo parte del sitio y servirlas junto
al resto del contenido del sitio. Ver sección de [Imagenes de obras](#imagenes-de-obras)

## Archivos necesarios para el correcto funcionamiento del sitio

### Archivos geoespaciales

La vista de las obras distribuidas espacialmente sobre el mapa de la jurisdiccion requiere de un archivo geojson con 
información geografica de la geometria de la jurisdicción. Este archivo geojson debe tener la siguiente estructura
```
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "First jurisdiction",
        "comuna": 1
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [lat, long],
            ...
            [lat, long]
          ]
        ]
      }
    },
    ...
    {
      "type": "Feature",
      "geometry": {
        "properties": {
          "id": "Last jurisdiction",
          "comuna": 15
        },
        "type": "Polygon",
        "coordinates": [
          [
            [lat, long],
            ...
            [lat, long]
          ]
        ]
      }
    }
    
  ],
  "properties": {
    "center": [0, 0],
    "zoomLevel": 100
  }
}
``` 

Cada feature corresponde a una subdivisión del area geografica. Debe haber por lo menos un feature con un poligono.

La propiedad `properties.id` y `properties.comuna` hacen referencia a las columnas `jurisdiccion` y `comuna`, 
respecticamente, del csv de datos del sitio y deben coincidir con los valores asignados a esas columnas. Como solo
una de estas columnas es obligatoria para el archivo de datos, entonces solo una propiedad tambien lo es para el
archivo geomtry.geojson (ver nota 3 del [esquema de datos](#esquema-de-datos))

La propiedad `properties.center` es un par de `[lat, long]` que debe ser definido como el punto central del 
mapa, y la propiedad `properties.zoomLevel` es el nivel de zoom al cual debe estar el mapa.

Dentro del repositorio hay dos copias de este archivo geojson. La primera ubicada en `app/geo/geometry.geojson`, usada
para cuando el sitio se levanta en modo desarrollo, y otra copia ubicada en `dist/geo/geometry.geojson`, usada para
cuando el sitio se levanta en modo productivo. Para leer más sobre estas dos formas de levantar el sitio, ver la 
sección de [Instrucciones para desarrolladores](#instrucciones-para-desarrolladores)

### Imagenes del sitio

El selector de la seccion de "Mapa" usa una imagen en formato svg. La imagen default del proyecto es la del mapa de la
ciudad de Buenos Aires. Para reemplazar esta imagen, pisar el archivo ubicado en `app/images/selectores/mapa.svg`. 

Para modificar el favicon del sitio, pisar el archivo `app/favicon.ico` con el favicon que se quiera utilizar.

Es necesario buildear el proyecto luego de modificar estas imagenes. Ver la siguiente seccion.

### Imagenes de obras

En caso de contar con imagenes de obras con urls accesibles publicamente, se pueden agregar al csv cómo celdas en las
columnas correspondientes (ver sección de [esquema de datos](#esquema-de-datos)). 

En caso de contar con imagenes cómo archivos que no tienen una url pública, es posible agregarlos a los archivos del 
sitio para que sean servidos de la misma forma que el resto de los archivos estáticos (html, js, css, etc).

Como se especifica en la sección de [Instalación por primera vez](#instalaci%C3%B3n-por-primera-vez), la carpeta 
`dist` se utiliza como root del servidor, con lo cual todos los archivos contenidos dentro serán servidos con un path
relativo a esta carpeta. Si posicionan archivos de imagenes en la carpeta `dist/images` entonces estarán 
disponibles públicamente de la misma forma que el resto de las imagenes dentro de dicha carpeta. 
Por ej, si la url base del sitio es `http://sitio-de-obras.com` y se posiciona una imagen `obra.jpg` en `dist/images`
entonces la url final de la imagen será `http://sitio-de-obras.com/images/obra.jpg`. 
Tambien es posible crear carpetas para organizar las imagenes. En caso de ubicar `obra.jpg` en una carpeta 
`obras-imagenes` dentro de `dist/images`, entonces la url final será 
`http://sitio-de-obras.com/images/obras-imagenes/obra.jpg`

## Instrucciones para desarrolladores

Para realizar modificaciones al sitio actual, realizar los siguientes pasos

* Clonar el proyecto usando git
* Instalar NodeJS. Recomendamos usar [nvm](https://github.com/creationix/nvm). Una vez instalado `nvm` ejecutar 
`nvm use` en la carpeta raiz del proyecto para asegurarse de usar la misma version de node.
* Instalar las dependencias de npm via `npm install` en la carpeta raiz del proyecto 
* Instalar las dependencias de bower via `bower install` en la carpeta raiz del proyecto
* Archivo de configuración: En /app duplicar el archivo config.js.example con el nombre config.js y configurar 
acorde a la [seccion correspondiente al archivo de configuración](#archivo-de-configuraci%C3%B3n)
* En caso de que el archivo de datos del sitio sea parte del sitio, ubicarlo dentro de la carpeta `app`
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
3. Crear el [archivo de configuración](#archivo-de-configuraci%C3%B3n)
4. En caso de que el archivo de datos del sitio sea parte del sitio, ubicarlo dentro de la carpeta `dist`
5. Apuntar las configuraciones del web server y subdominio a la carpeta `dist`, donde se encuentran los archivos 
finales y compilados.

### Actualizaciones

En caso de querer actualizar a la ultima version disponible, ubicarse en la carpeta raiz del proyecto y ejecutar
`git pull`.

Si no se han realizado cambios en el proyecto respecto a la version de github, entonces `git pull` deberá exitosamente
actualizar el proyecto a su ultima version.

Si en cambio se han realizado cambios en el proyecto y el comando `git pull` devuelve algun error de conflicto de
versiones de archivos, debera procederse a mergear manualmente los archivos correspondientes.
- Realizar copias de resguardo de los archivos que no son parte del proyecto original o que han sido modificados. 
Por ej, el archivo csv con los datos de las obras del lugar actual, el archivo geometry.geojson, el archivo config.js, 
el archivo custom.css en caso de haberlo modificado y cualquier otro archivo (como por ej iconos, favicon, etc) que 
se hayan agregado o reemplazado respecto a la version de github de BA Obras
- Revertir los cambios de la version local del repositorio para que quede acorde a la version de github. Esto puede
realizarse mediante `git checkout .` para revertir cambios a archivos registrados en git, y mediante 
`git clean -d -f .` para eliminar archivos no registrados en git.
- Ejecutar de vuelta `git pull`. Esta vez no deberia tener conflictos
- Volver a copiar los archivos resguardados en el primer punto
- Realizar un `grunt build` para compilar nuevamente el sitio. Este ultimo paso deberia dejar en la carpeta `dist` 
la version actualizada del sitio productivo.

#### Cambios entre versiones

El dia 3 de junio de 2019 se agregó un requisito al archivo `geomtry.geojson`, siendo ahora necesario que cada 
componente de primer nivel del mapa disponga de un atributo `"properties": { "id": "Nombre de la subdivision" }`.
Para mas información, ver la sección sobre [Archivos geoespaciales](#archivos-geoespaciales).

## Archivo de Configuración

El archivo de configuración `config.js` deberá configurarse acordemente para poder levantar el sitio en modo de
desarrollo o producción. Existen dos ejemplos del archivo de configuración `config.js.example` en las carpetas `app`
y `dist` para servir de base al archivo de configuración de desarrollo `app/config.js` y al archivo de configuración
de producción `dist/config.js`.

Hay dos formas a traves de las cuales puede cargarse el archivo de datos para el sitio: mediante un request `get` a un
archivo dentro del sitio o mediante un request `jsonp` a una url externa. En caso de que el archivo sea parte del sitio
es necesario setear `DATA_PATH` como el nombre de archivo. Por ej, si el archivo de datos se llama `data.csv` y está 
ubicado en `app/data.csv` (para desarrollo) y `dist/data.csv` (para produccion) entonces `DATA_PATH` deberá tener
valor `data.csv`.

| Config                | Valor                 | Descripción                                                                                                           |
| --------------------- |---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `LOAD_USING_JSONP`    | `true\|false`         | Indica si el archivo de datos deberá ser cargado utilizando un request via jsonp o si deberá ser cargado localmente.  |
| `DATA_PATH`           | String                | Url o nombre de archivo                                                                                               |
| `USE_USIG_MAP_TILES`  | `true\|false`         | Indica si los mapas deberan usar tilemaps de USIG (soporte unicamente para Buenos Aires)                              |
| `CITY_NAME`           | String                | Nombre de la jurisdicción correspondiente al sitio                                                                    |
| `DATA_ORIGIN`         | String                | Valor por defecto: `undefined`. Único otro valor soportado: `andino-json-api`                                         |

### i18n

Se encuentra disponible un archivo con la traduccion de todos los textos presentados al usuario. Este archivo está 
pensado para ser modificado en caso de querer levantar el sitio en un idioma distinto al español o en caso de tener
que modificar la nomenclatura actual del sitio.

El archivo se encuentra en `app/scripts/i18n.js`. En caso de modificar las traducciones, es necesario re-buildear el
sitio (ver seccion de instrucciones para desarrolladores).   
