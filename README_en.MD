# [BA Obras](https://obras.buenosaires.gob.ar/)

[![Build Status](https://travis-ci.com/datosgcba/ba_obras.svg?branch=master)](https://travis-ci.com/datosgcba/ba_obras)

[Documentación en español](./README.MD)

Visualization and analysis project of the planned construction works of the Buenos Aires city government.

  - [About BA Obras](#about-ba-obras)
  - [Data requirements](#data-requirements)
    - [Data scheme](#data-scheme)
  - [Required files to run the site](#required-files-to-run-the-site)
    - [Geospacial file](#geospacial-file)
    - [Site images](#site-images)
    - [Construction works images](#construction-works-images)
  - [Development instructions](#development-instructions)
    - [Visual adaptations and changes](#visual-adaptations-and-changes)
  - [Running the site in a production environment](#running-the-site-in-a-production-environment)
    - [Requirements](#requirements)
    - [Configuration](#configuration)
    - [First time setup](#first-time-setup)
    - [Updates](#updates)
  - [Configuration file](#configuration-file)
    - [i18n](#i18n)

## About BA Obras 

BA Obras is a website aimed at informing the citizens about the progress of the planned construction works in their
jurisdiction. The project is a website that loads the relevant data from a csv file and builds data visualizations
from it about the progress, state, cost and other attributes from each of the works. The website generates a view that 
lists all the planned works and also generates a view for each of the works. The site can be embed into other sites.

The original project can be seen in [obras.buenosaires.gob.ar](https://obras.buenosaires.gob.ar/)

The project is a web-app that only has a frontend and doesn't need a backend. Doesn't have forms, submits or need for
a database. All the data is loaded from a unique static csv file. The site is built as a single page application based
on angular-js

## Data requirements

The site uses a csv data source that can be hosted in the site or can be part of an external service. See the details
about the data source connection in the [configuration file section](#configuration-file)  

### Data scheme

| Column name                 | Required / optional column | Data type       | Detail                                               |
| --------------------------- |--------------------------- | --------------- | ---------------------------------------------------- |
| `nombre`                    | Required                   | Text            | Name of the planned construction work                |
| `lat`                       | Required                   | Numeric¹        | Latitude                                             |
| `lng`                       | Required                   | Numeric¹        | Longitude                                            |
| `descripcion`               | Required                   | Text            | Description of the work                              |
| `entorno`                   | Required                   | Category (Text) | Territorial classification of the work               |
| `monto_contrato`            | Required                   | Numeric¹        | Budgeted cost of the work                            |
| `etapa`                     | Required                   | Category (Text). One of the following: `En proyecto`, `En licitacion`, `En ejecucion`, `Finalizada` | State of the work. `En proyecto` means `In progress`, `En licitacion` means `In bidding`, `En ejecución` means `In action` and `Finalizada` means `Finished` |
| `tipo`                      | Required                   | Category (Text) | Work type. The values of this cell must match with the predefined types or, otherwise, new types and icons must be added to the site.² |
| `comuna`                    | Optional³                  | Numeric¹        | Number of the commune                                |
| `jurisdiccion`              | Optional³                  | Category (Text) | Name of the jurisdiction where the work is           |
| `mano_obra`                 | Optional                   | Numeric¹        | Amount of workers needed                             |
| `porcentaje_avance`         | Optional                   | Numeric¹        | Completed work percentage                            |
| `id`                        | Optional                   | Numeric¹        | Work id                                              |
| `etapa_detalle`             | Optional                   | Text            | Extra information about the state                    |
| `area_responsable`          | Optional                   | Category (Text) | Responsable government area                          |
| `barrio`                    | Optional                   | Text            | Neighborhood name                                    |
| `calle_1`                   | Optional                   | Text            | Street name                                          |
| `seccion`                   | Optional                   | Numeric¹        | Section number                                       |
| `manzana`                   | Optional                   | Numeric¹        | City block number                                    |
| `parcela`                   | Optional                   | Numeric¹        | Parcel number                                        |
| `direccion`                 | Optional                   | Text            | Street address                                       |
| `fecha_inicio`              | Optional                   | Date            | Starting date of the work                            |
| `fecha_fin_inicial`         | Optional                   | Date            | Ending date of the work                              |
| `plazo_meses`               | Optional                   | Numeric¹        | Month amount that the work needs / took place        |
| `imagen_1`                  | Optional                   | Url⁴            | Url of an image from the work                        |
| `imagen_2`                  | Optional                   | Url⁴            | Url of a secondary image                             |
| `imagen_3`                  | Optional                   | Url⁴            | Url of a secondary image                             |
| `imagen_4`                  | Optional                   | Url⁴            | Url of a secondary image                             |
| `licitacion_oferta_empresa` | Optional                   | Text            | Company name                                         |
| `licitacion_anio`           | Optional                   | Numeric¹        | Bidding year                                         |
| `benficiarios`              | Optional                   | Numeric¹        | Amount of beneficiaries                              |
| `compromiso`                | Optional                   | Text            | Commitment name                                      |
| `link_interno`              | Optional                   | Url             | Further information link url                         |
| `pliego_descarga`           | Optional                   | Url             | Legal information link url                           |

¹ Have in mind that the numbers must follow the international format. That is, must have a decimal dot `.` and must not
contain any thousand separator, 
Tener en cuenta que es importante formatear los numeros de forma tal que el separador decimal sea `.` y no deben 
contar con separadores de miles, comillas, caracter de moneda, ni otros caracteres especiales. 

² The current work types that have icons are the following: `Arquitectura`, `Escuelas`, `Espacio publico`, 
`Hidraulica e infraestructura`, `Hidraulica`, `Salud`, `Transporte` y `Vivienda`. To add icons to more types, svg files
with the corresponding filenames must be added to the folder `app/images/iconos`. The filenames must be all in lowercase
and have `-` instead of spaces. For example, if the work type is `Public space` then the svg icon must be named 
`public-space.svg`. After the icons are added, the project must be built again (see the development instructions 
section).

³ Altough `comuna` and `jurisdiccion` are optional, one of their must be present

⁴ In case of having images without publicly accesible urls, it is possible to incorporate them as part of the site and
serve them with the rest of the static files of the site. 
See the [Construction works images](#construction-works-images) section

## Required files to run the site

### Geospacial file

The map view of the jurisdiction and its planned works needs a geojson file with the geografic information of the 
jurisdiction's geometry. This geojson file must have the following scheme
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

Each feature in the geojson represents a subdivision of the geographic area. There must be at least one feature with
a polygon.

The properties `properties.id` y `properties.comuna` are referencies to the columns `jurisdiccion` and `comuna`
of the csv data file, respectively, and must have the same values as the ones in those columns. Remember that only
one column is obligatory, and so only one property also is obligatory (see note 3 of the [Data scheme](#data-scheme) 
section)

The property `properties.center` is a `[lat, long]` pair that must be defined as the crental point of the map and the 
property `properties.zoomLevel` is the zoom level of the map. This two properties must be fine tuned to place the 
map properly.

There are two copies of this geojson file inside the repository. The first one is placed in `app/geo/geometry.geojson` 
and used for the development server, and the second one placed in `dist/geo/geometry.geojson` and used for the 
production server. To know more about the different modes of running the site, read the 
[Development instructions](#development-instructions) section

### Site images

The "Map" section button uses a svg image. The default image of the project is a map of the Buenos Aires city. To 
change this image, replace the file placed at `app/images/selectores/mapa.svg`.

To change the site's favicon, replace the file `app/favicon.ico` with the desired icon.

After any of these modifications is necessary to build again the project. See the next section

### Construction works images

In case of having images with publicly accessible urls, they can be added to the csv as cells in the corresponding
columns (see the [Data scheme](#data-scheme) section)

If instead the images aren't upload to any public server, it is possible to add them as part of the static files of
the site in order to be served in the same way as the rest of the static files (html, js, css, etc). 

As specified in the [First time setup](#first-time-setup) section, the `dist` folder is used as the root folder of the
site. If images are placed in the `dist/images` folder them they will be publicly accessible as the rest of the images
inside that folder.
For example, if the base url of the site is `http://some-site.com` and a `example.jpg` image is placed in `dist/images`
then the final url for that image will be `http://some-site.com/images/example.jpg`.  
It is also possible to create folders to organize the images. In case of placing the `example.jpg` in a `custom-images`
folder inside `dist/images`, then the final url will be `http://some-site.com/images/custom-images/example.jpg`.

## Development instructions

To add changes to the project, follow the next steps

* Clone the project using git
* Install NodeJs. The use of [nvm](https://github.com/creationix/nvm) is recommended. Once `nvm` is installed, run
`nvm use` inside the main folder of the project to ensure that a proper node version is use.
* Install the npm dependencies via `npm install` in the main project folder.
* Install the bower dependencies via `bower install` in the main project folder.
* In the `/app` folder create a `config.js` file. There already exists a `config.js.example` that serves as an example
for the configuration file. See the [configuration file section](#configuration-file).
* If the data file is going to be part of the site, then it must be placed inside the `app` folder.
* Run the development tasks suite via `grunt serve`. This will build all the assets and run a local server.
* Make the necessary changes in the `/app` folder. You'll see the changes reflected in the local server. (Defaults to
http://localhost:10000)
* Once the development in `/app` is done, compile the final assets via `grunt build`

### Visual adaptations and changes

If you need to add css changes to the site, place them inside the `app/styles/custom.css` file. This file has
priority over the base site styles.

Once this file is modified, run the `grunt build` script to compile the css changes into the `dist` folder with the
rest of the final assets.


## Running the site in a production environment

### Requirements

The only requirement to run the site is a web server. All the files, code and assets of the project are client side
assets that are already built and placed in the `/dist` folder. The following steps are for running the site in a 
production environment. To develop and add changes to the project, read the previous section.

* Use Apache, NGINX or the server of your choice
* Varnish or other cache service (optional, for better performance)
* It's not necessary to build the project.
* It's not necessary to have internet access from the server.
* It's not necessary to install dependencies
* All the files needed are already compiled and minified into static files in the `/dist` folder.

### Configuration

* The only required configuration step is the creation of the configuration file.
* If the data source is going to be a local file, then place the csv file inside the `/dist` folder and configure
the configuration file accordingly.
* The project doesn't need any environment or process variables.

### First time setup

1. Crete a domain,subdomain or path to the application. For example: 
`https://obras-site.buenosaires.gob.ar/`.
2. Run a web server with nginx, apache or a similiar service and clone the project using 
`git clone https://github.com/datosgcba/ba_obras.git`.
3. Create the [Configuration file](#configuration-file)
4. If the data source is going to be a csv file hosted inside the site, then placed it in the `/dist` folder
5. Point the server configuration as to have the `/dist` folder as the base folder for the project.

### Updates

If updating to the last changes available, simply run a `git pull` while in the root folder of the project.

If the local repository has no changes when comparing to the github repository, then the `git pull` command should
run successfully and the project should be updated to the last version.

Otherwise, if the local repository has changes when comparing to the github repository and the `git pull` returns
a file conflict error, then the files must be merged manually.
- Make backup copies of any file that is not part of the original project or has been modified. For example, the csv
with the works data, the geometry.geojson file, the config.js file, the custom.css file (if modified) and any other
file (icons, favicons, etc) that has been added or modified from the original github repository of BA Obras.
- Revert any change of the local repository. This can be achieved with `git checkout .` to revert any change to
files tracked by git, and by `git clean -d -f .` to delete any file not tracked by git.
- Again run `git pull`. This time shouldn't return any conflict.
- Copy again any backuped file in the first step
- Run a `grunt build` command in order to compile again the site. This should output a final and productive version
of the site to the `dist` folder

#### Changes between versions

On june 3 2019 a requirement was added to the `geometry.geojson`, now being obligatory to have an attribute
`"properties": { "id": "Nombre de la subdivision" }` in the first level features of the geojson. For further 
information read the [geospacial file](#geospacial-file) section.

## Configuration file

The configuration file `config.js` must be configured accordingly in order to run the site properly in development or
production mode. Two example configuration files `config.js.example` exists and are placed in the `app` and `dist` 
folders. These two files serve as the development and production configuration files respectively. `app/config.js` as 
the development configuration file, and `dist/config.js` as the production configuration file.

There are two ways to connect the data source into the site. The first one is to place the csv file inside the project.
The site will then load the file using a `get` request to the local path. The second option is to make a `jsonp` 
request to an external site that already serves the data. To configurate this interaction, the `LOAD_USING_JSONP` 
boolean and `DATA_PATH` string must be properly configured inside the configuration file. 

If the data file is going to be hosted inside the project, then the `DATA_PATH` property must contain the filename of
the data file. For ex, if the data file is named `data.csv` and is placed in `app/data.csv` (for development) and 
`dist/data.csv` (for production) then the `DATA_PATH` must be the string `"data.csv"`.

| Config property       | Value                 | Description                                                                                                           |
| --------------------- |---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `LOAD_USING_JSONP`    | `true\|false`         | If `true` then the csv file will be loaded using a `jsonp` request to the `DATA_PATH` property. Else, it will be loaded using a `get` request to the `DATA_PATH` property.  |
| `DATA_PATH`           | String                | Url or filename                                                                                                       |
| `USE_USIG_MAP_TILES`  | `true\|false`         | Flag to determine if the tilemaps must be loaded from USIG (Buenos Aires only)                                        |
| `CITY_NAME`           | String                | Name of the jurisdiction of the site                                                                                  |
| `DATA_ORIGIN`         | String                | Default value: `undefined`. Only one other value is supported: `andino-json-api`                                      |

### i18n

A file with all the string translations that the site shows to the user is available. This file serves the purpose of
offering the possibility of translating the whole site to another language or to modify the current spanish translation.

The file is placed at `app/scripts/i18n.js`. If the translations are modified, is necessary to re-build the project 
(see the development instructions section).
