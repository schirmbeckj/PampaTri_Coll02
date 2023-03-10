/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var errores = /* color: #d63000 */ee.Geometry.Point([-49.09637332539229, -29.63702859279615]),
    N2_Cuerpos_de_agua = /* color: #0000ff */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-41.21811500733122, -22.6747139537469]),
            {
              "reference": 33,
              "system:index": "0"
            })]),
    N2_Area_no_vegetada = /* color: #ea9999 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-41.21811500733122, -22.6747139537469]),
            {
              "reference": 22,
              "system:index": "0"
            })]),
    N3_Bosque_cerrado = /* color: #006400 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-49.13091607882835, -29.617273786470346]),
            {
              "reference": 3,
              "system:index": "0"
            })]),
    N2_Plantaciones_forestales = /* color: #935132 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-49.0958791544041, -29.54493551570798]),
            {
              "reference": 9,
              "system:index": "0"
            })]),
    N2_Area_humeda_natural = /* color: #45c2a5 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-41.21811500733122, -22.6747139537469]),
            {
              "reference": 11,
              "system:index": "0"
            })]),
    N2_Pastizal = /* color: #b8af4f */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-41.21811500733122, -22.6747139537469]),
            {
              "reference": 12,
              "system:index": "0"
            })]),
    N2_Pastura = /* color: #ffd966 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-49.01006646945335, -29.60772241383939]),
            {
              "reference": 15,
              "system:index": "0"
            })]),
    region = ee.FeatureCollection("projects/MapBiomas_Pampa/ANCILLARY_DATA/LimiteBiomasPampaTrinacional_col2_buffer"),
    N3_Bosque_abierto = /* color: #32cd32 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-41.54345414253685, -22.496234190714357]),
            {
              "reference": 4,
              "system:index": "0"
            })]),
    N2_Agricultura = /* color: #e974ed */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-48.97585977841764, -29.56689018500187]),
            {
              "reference": 18,
              "system:index": "0"
            })]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/** 
 * Clasificaci??n Colecci??n 2.0 MapBiomas Pampa
 * 
 * Codigos recopilados por Sarrailh?? Sofia, de Banchero Santiago y Schirmbreckj Juliano
 * con ayuda de Schirmbreckj Juliano y Barbieri Andrea 
 * 
 *  CZ: Con Zonificaci??n
 * 
 *  INPUTS: 
 *    - Mosaicos colecci??n 2
 *    - Muestras estables colecci??n 2
 *    - Zonas colecci??n 2
 *    - Colecci??n 1 para ver diferencias
 *  
 * OUTPUT: 
 *    -Clasificaciones anuales por zona, seg??n el periodo de a??os y la zona utilizada
 * 
 * 
 * PARA UTILIZAR EL SCIRPT
 * Las lineas a modificar son de la 30 a la 57 y modificar POR ZONA el balanceo de las 
 * muestras a entre las lineas 373 y 399
 * 
 * verificar cuales classes est??n el la zona o no: AR 447 a 455   UY  473 a 478
 * 
 * */

//Comentar la varibles "bioma" de los paises que no se desea utilizar
//var bioma = "PAMPAURUGUAY"
var bioma = "PAMPAARGENTINA"

//Cada script debe utilizarse para una unica zona
// Guardar una copia p??r zona
var id_zona ="1"  // Identificador de Zona. Siempre entre comillas
//Zonas Argentina: 1, 2, 3, 4, 5, 6, 7, 8, 9
//Zonas Uruguay: cristalino, graben_L, Sierras_Este, sedimentaria_gnw, basaltica, graben_SL, sedimentaria_Oeste
var version_clasificacion = "1" //Entre comillas, permite tener diferentes versiones

var desvio = 0 // desvio para calculo de balanceamento de amostras
var nSamplesMin = 100;//numero de muestras minimo =10% de las 2000 muestras de la classe en la zona
var nSamplesMax = 1000;

//Cambiar los a??os de inicio y fin una sola vez, si se desea establecer un nuevo periodo
// guardar un script nuevo y ah?? modificar estas variables
var year_inicio = 1985 //A??o en el cual se desea comenzar a clasificar
var year_fin = 1999 // A??o en el cual se desea terminar de clasificar


//A continuaci??n se decide si se quiere o no calcular el area y la matriz de confusion. 
// Se utliliza el valor 1 para que se calcule y 0 para que no se calcule
var calcula_area = 1 
var year_calcula_area = '1985'
var year_acuracia = '2000'
var calcula_acuracia = 0 // Si es 1 calcula la exactitud (acuracia)
var conf_mat = 0 // Si es 1 calcula la matriz de confusion
var clase_diferencia = 21
var cant_muestras = 1 //Si es 1 calcula la cantidad de muestras por clase por a??o
var nro_arboles = 100 //Numero de arboles que utiliza el Random Forest
                     // Setear en un numero bajo (15) y luego para exportar
                     // utilizar al menos 50


//A PARTIR DE ACA NO TOCAR

//Si la variable bioma es PAMPAARGENTINA se utilizaran los datos de Argentina
// Si es PAMPAURUGUAY se utilizaran los datos de Uruguay
if (bioma == "PAMPAARGENTINA" ) {
  //De donde salen las muestras
  var dirsamples = "projects/MapBiomas_Pampa/SAMPLES/C2/ARGENTINA/YEARF2/"
  //Nombre para filtrar los mosaicos
  var region_mosaic = "PAMPA-ARGENTINA-2"
  //Shape con zonas
  var zonas = ee.FeatureCollection("projects/MapBiomas_Pampa/ANCILLARY_DATA/C2/Zonas_ARG_C2_conbuffer")
  // Donde se guardan las clasificaciones HAY QUE HACER UN ASSET NUEVO!!
  var output = "projects/MapBiomas_Pampa/WORKSPACE/COLLECTION2/ARGENTINA/classification_c2/"
  var limite = ee.Feature(zonas.filter(ee.Filter.eq("idZona", id_zona)).first()).geometry()
  var myRegion = zonas.filterMetadata('idZona', 'equals', id_zona)
  var nomsampl  = 'AR'

  
}

if (bioma == "PAMPAURUGUAY" ) {
  //De donde salen las muestras
  var dirsamples = "projects/MapBiomas_Pampa/SAMPLES/C2/URUGUAY/YEARF/"

  //Nombre para filtrar los mosaicos
  var region_mosaic = "PAMPA-URUGUAY-2"
  //Shape con zonas
  var zonas = ee.FeatureCollection("projects/MapBiomas_Pampa/WORKSPACE/Uruguay/RegionesUy")
  // Donde se guardan las clasificaciones HAY QUE HACER UN ASSET NUEVO!!
  var output = "projects/MapBiomas_Pampa/WORKSPACE/COLLECTION2/URUGUAY/classification_c2/"
  var limite = ee.Feature(zonas.filter(ee.Filter.eq("ECOZONA", id_zona)).first()).geometry()
  var myRegion = zonas.filterMetadata('ECOZONA', 'equals', id_zona)
  var nomsampl  = 'UY'
   }
var version_muestras = "1"//no se cambia!
var version_mosaico = '4' //version de los mosaics de la col 2 entre comillas


// Serie de tiempo
var ts = require("users/santiagobanchero/plots:plots.js")

var buffer_size = 15000;

// Atributo target en el feature space de entrenamiento
var target = "reference";



var region = region.filter(ee.Filter.eq("biome", bioma))


//Script de Juliano que calcula las diferencias
var diferenca = require('users/schirmbeckj/PampaTriNacional:Utils/Passo100_Mapa_Diferencas_Classe_v02.js').diferenca

// mosaicos
var mosaics =  ee.ImageCollection('projects/nexgenmap/MapBiomas2/LANDSAT/PAMPA/mosaics')
                 .merge(ee.ImageCollection('projects/nexgenmap/MapBiomas2/LANDSAT/PAMPA/mosaics-landsat-7'))
                 .filterMetadata('version', 'equals', version_mosaico)
                 .filterMetadata('biome', 'equals', bioma)


//nombres de las bandas
{var bandNames = ee.List([
'evi2_amp',
'gv_amp',
'ndfi_amp',
'ndvi_amp',
'ndwi_amp',
'soil_amp',
'wefi_amp',
'blue_median',
'blue_median_dry',
'blue_median_wet',
'cai_median',
'cai_median_dry',
'cloud_median',
'evi2_median',
'evi2_median_dry',
'evi2_median_wet',
'gcvi_median',
'gcvi_median_dry',
'gcvi_median_wet',
'green_median',
'green_median_dry',
'green_median_wet',
'green_median_texture',
'gv_median',
'gvs_median',
'gvs_median_dry',
'gvs_median_wet',
'hallcover_median',
'latitude', //calculada no script
'longitude', //calculada no script
'ndfi_median',
'ndfi_median_dry',
'ndfi_median_wet',
'ndvi_median',
'ndvi_median_dry',
'ndvi_median_wet',
'ndvi_amp_3y', //calculada no script DESCOMENTAR CUANDO HAYA MAS A??OS
'ndwi_median',
'ndwi_median_dry',
'ndwi_median_wet',
'nir_median',
'nir_median_dry',
'nir_median_wet',
'npv_median',
'pri_median',
'pri_median_dry',
'pri_median_wet',
'red_median',
'red_median_dry',
'red_median_wet',
'savi_median',
'savi_median_dry',
'savi_median_wet',
'sefi_median',
'sefi_median_dry',
'shade_median',
'soil_median',
'swir1_median',
'swir1_median_dry',
'swir1_median_wet',
'swir2_median',
'swir2_median_dry',
'swir2_median_wet',
'wefi_median',
'wefi_median_wet',
'blue_min',
'green_min',
'nir_min',
'red_min',
'swir1_min',
'swir2_min',
'blue_stdDev',
'cai_stdDev',
'cloud_stdDev',
'evi2_stdDev',
'gcvi_stdDev',
'green_stdDev',
'gv_stdDev',
'gvs_stdDev',
'hallcover_stdDev',
'ndfi_stdDev',
'ndvi_stdDev',
'ndwi_stdDev',
'nir_stdDev',
'red_stdDev',
'savi_stdDev',
'sefi_stdDev',
'shade_stdDev',
'soil_stdDev',
'swir1_stdDev',
'swir2_stdDev',
'wefi_stdDev',
'slope'
]);


var bandNamesShort = ee.List([
'evi2_a',
'gv_a',
'ndfi_a',
'ndvi_a',
'ndwi_a',
'soil_a',
'wefi_a',
'blue_m',
'blue_m_d',
'blue_m_w',
'cai_m',
'cai_m_d',
'cloud_m',
'evi2_m',
'evi2_m_d',
'evi2_m_w',
'gcvi_m',
'gcvi_m_d',
'gcvi_m_w',
'green_m',
'green_m_d',
'green_m_w',
'green_m_t',
'gv_m',
'gvs_m',
'gvs_m_d',
'gvs_m_w',
'hallcov_m',
'lat', //calculada no script
'long', //calculada no script
'ndfi_m',
'ndfi_m_d',
'ndfi_m_w',
'ndvi_m',
'ndvi_m_d',
'ndvi_m_w',
'ndvi_a_3y', //calculada no script DESCOMENTAR DESPUES
'ndwi_m',
'ndwi_m_d',
'ndwi_m_w',
'nir_m',
'nir_m_d',
'nir_m_w',
'npv_m',
'pri_m',
'pri_m_d',
'pri_m_w',
'red_m',
'red_m_d',
'red_m_w',
'savi_m',
'savi_m_d',
'savi_m_w',
'sefi_m',
'sefi_m_d',
'shade_m',
'soil_m',
'swir1_m',
'swir1_m_d',
'swir1_m_w',
'swir2_m',
'swir2_m_d',
'swir2_m_w',
'wefi_m',
'wefi_m_w',
'blue_min',
'green_min',
'nir_min',
'red_min',
'swir1_min',
'swir2_min',
'blue_sD',
'cai_sD',
'cloud_sD',
'evi2_sD',
'gcvi_sD',
'green_sD',
'gv_sD',
'gvs_sD',
'hallcov_sD',
'ndfi_sD',
'ndvi_sD',
'ndwi_sD',
'nir_sD',
'red_sD',
'savi_sD',
'sefi_sD',
'shade_sD',
'soil_sD',
'swir1_sD',
'swir2_sD',
'wefi_sD',
'slope'
])}

// Estilos & Visualizaci??n
//colors da los colores de la clasificaci??n y est??n en orden, es decir el color ubicado en el primer puesto corresponde a la clase 1
//En este caso empieza de la clase 2, que es Bosque. Los colores a modificar son los que se encuentran en los puestos 2, 3, 4, 9, 11,
//  12, 15, 18, 22 y 33
//                1           2         3         4           5          6          7          8           9         10         11         12         13          14        15         16          17        18           19      20           21       22          23           24       25         26         27       28            29        30         31         32          33     
var colors = ["#ffffff", "#1f4423", "#006400", "#32cd32", "#00ff00", "#ffffff", "#76a5af", "#ffffff", "#935132", "#935132", "#45c2a5", "#b8af4f", "#b8af4f", "#ffffff", "#ffd966", "#ffd966", "#ffffff", "#e974ed", "#ffffff", "#d5a6bd", "#ffefc3", "#ea9999", "#d0d0d0", "#ffffff", "#ffffff", "#ffffff", "#0000ff", "#d5d5e5", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#0000ff"]


//Visualizador de las clasificaciones
var vis_class =  {
      "bands": ["classification_2019"],
      "min": 1,
      "max": 33,
      "palette": colors,
      "format": "png"
    }
//Visualizador de las diferencias
var vischange = {"min": 0, "max": 3,
        "palette": "ffffff,ff0000,e6f919,aaaaaa",    //amarelo=e6f919    magenta=bb34c0
        "format": "png"
  }
  
//Visualizador de los mosaicos
var RGBvis = {
        bands: ['swir1_median', 'nir_median', 'red_median'],
        gain: [0.08, 0.06, 0.2],
        gamma: 0.85
    };



// COMPLEMENTARIAS: Ac?? se realiza la uni??n de las complementarias
var complementarias = N2_Cuerpos_de_agua
                        .merge(N2_Area_no_vegetada)
                        .merge(N3_Bosque_cerrado)
                        .merge(N3_Bosque_abierto)
                        .merge(N2_Plantaciones_forestales)
                        .merge(N2_Area_humeda_natural)
                        .merge(N2_Pastizal)
                        .merge(N2_Pastura)
                        .merge(N2_Agricultura)
                        .filterBounds(limite); // Se filtra por el limite con buffer.
                                               // Por defoult cada uno tiene una muestra en
                                               // la coordenada [0,0] para que no se borre la 
                                               // propiedad clase
                        
//print(complementarias)

var clasificacion_completa = null // Es la imagen donde se guardan todas las clasificaciones

// BUCLE PRINCIPAL POR A??OS: INICIO
var years = ee.List.sequence(year_inicio, year_fin,1).getInfo();
years.map(function(year){

//Balanceo de muestras por a??o y clase siguiendo metodolog??a Pampa Brasil
// ejemplo de como completar cada una: percent_Flo = b0    + desvio + year *  b1
// OJO en el excel est??n los numeros con coma y aca van con puntos
//Carpeta con planillas: https://drive.google.com/drive/folders/1bVP1mUgoyrE95111vU8JwnWAT1Ef-7WT
// Si no posee alguna clase, dejarla tal y como esta, se seleccionan en otro paso
 if (year >= 1985 && year <= 1999){ // ajustar para cada per??odo por zona 
    var percent_Flo = 7
    var percent_FlC = 6.20969    + desvio + year *  -0.003082706767 //Clase 3 
    var percent_FlA = -562.93    + desvio + year *  0.29481 //Clase 4
    var percent_PlF = -20.66    + desvio + year *  0.01086 //Clase 9 - 1
    var percent_PlF = 5
    var percent_Umi =   7.48    + 3 + year *  0.00414 //Clase 11 - 2
    var percent_Cam = 301.52    + 0 + year * -0.13691 //Clase 12	 - 3
    var percent_Pas = 401.7404511    + desvio + year *  -0.1803759398 //Clase 15 	
    var percent_Agr = 169.7513534    + desvio + year *  -0.07112781955 //Clase 18 	
    var percent_Anv =    -50.97867 + desvio + year *  0.02696 //Clase 22 - 5
    var percent_Agu =   19.90    + desvio + year *  -0.00534 //Clase 33 	- 6
    var percent_AgP = -163.35    + 4 + year *  0.10150 //Clase 21 - 4

    }

 if (year >= 2000){ // ajustar para cada periodo por zona
   //var percent_Flo = 6.09    + desvio + year *  -0.00120 //Clase 2 - 0
   var percent_Flo = 7
   // var percent_FlC = 6.20969    + desvio + year *  -0.003082706767 //Clase 3 
   // var percent_FlA = -562.93    + desvio + year *  0.29481 //Clase 4
   // var percent_PlF = -20.66    + desvio + year *  0.01086 //Clase 9 - 1
   var percent_PlF = 5
    var percent_Umi =   7.48    + 3 + year *  0.00414 //Clase 11 - 2
    var percent_Cam = 301.52    + 0 + year * -0.13691 //Clase 12	 - 3
    //var percent_Pas = 401.7404511    + desvio + year *  -0.1803759398 //Clase 15 	
   // var percent_Agr = 169.7513534    + desvio + year *  -0.07112781955 //Clase 18 	
    var percent_AgP = -163.35    + 4 + year *  0.10150 //Clase 21 - 4
    //var percent_Anv =    -50.97867 + desvio + year *  0.02696 //Clase 22 - 5
    var percent_Anv = 6
    var percent_Agu =   19.90    + desvio + year *  -0.00534 //Clase 33 	- 6
 }
 
var n_amostas = ee.Feature(ee.Geometry.Point([0, 0]))
var n_amostas2 = ee.Feature(ee.Geometry.Point([0, 0]))


var balanced = ee.FeatureCollection(dirsamples + 'datos-arg-analisis-1-' + year +'-m3').filterMetadata('Muestras3', "equals",  1)

    var SS_Flo = balanced.filterMetadata('reference', 'equals', 2).filterBounds(limite)
    var SS_FlC = balanced.filterMetadata('reference', 'equals', 3).filterBounds(limite)
    var SS_FlA = balanced.filterMetadata('reference', 'equals', 4).filterBounds(limite)
    var SS_PlF = balanced.filterMetadata('reference', 'equals', 9).filterBounds(limite)
    var SS_Umi = balanced.filterMetadata('reference', 'equals', 11).filterBounds(limite)
    var SS_Cam = balanced.filterMetadata('reference', 'equals', 12).filterBounds(limite)
    var SS_Pas = balanced.filterMetadata('reference', 'equals', 15).filterBounds(limite)
    var SS_Agr = balanced.filterMetadata('reference', 'equals', 18).filterBounds(limite)
    var SS_AgP = balanced.filterMetadata('reference', 'equals', 21).filterBounds(limite)
    var SS_Anv = balanced.filterMetadata('reference', 'equals', 22).filterBounds(limite)
    var SS_Agu = balanced.filterMetadata('reference', 'equals', 33).filterBounds(limite)

    var n_samples_Flo = ee.Number(ee.Number(nSamplesMax).multiply(percent_Flo).divide(100)).round().int16().max(nSamplesMin).min(nSamplesMax)
    var n_samples_FlC = ee.Number(ee.Number(nSamplesMax).multiply(percent_FlC).divide(100)).round().int16().max(nSamplesMin).min(nSamplesMax)
    var n_samples_FlA = ee.Number(ee.Number(nSamplesMax).multiply(percent_FlA).divide(100)).round().int16().max(nSamplesMin).min(nSamplesMax)
    var n_samples_PlF = ee.Number(ee.Number(nSamplesMax).multiply(percent_PlF).divide(100)).round().int16().max(nSamplesMin).min(nSamplesMax)
    var n_samples_Umi = ee.Number(ee.Number(nSamplesMax).multiply(percent_Umi).divide(100)).round().int16().max(nSamplesMin).min(nSamplesMax)
    var n_samples_Cam = ee.Number(ee.Number(nSamplesMax).multiply(percent_Cam).divide(100)).round().int16().max(nSamplesMin).min(nSamplesMax)
    var n_samples_Pas = ee.Number(ee.Number(nSamplesMax).multiply(percent_Pas).divide(100)).round().int16().max(nSamplesMin).min(nSamplesMax)
    var n_samples_Agr = ee.Number(ee.Number(nSamplesMax).multiply(percent_Agr).divide(100)).round().int16().max(nSamplesMin).min(nSamplesMax)
    var n_samples_AgP = ee.Number(ee.Number(nSamplesMax).multiply(percent_AgP).divide(100)).round().int16().max(nSamplesMin).min(nSamplesMax)
    var n_samples_Anv = ee.Number(ee.Number(nSamplesMax).multiply(percent_Anv).divide(100)).round().int16().max(nSamplesMin).min(nSamplesMax)
    var n_samples_Agu = ee.Number(ee.Number(nSamplesMax).multiply(percent_Agu).divide(100)).round().int16().max(nSamplesMin).min(nSamplesMax)


    var SS_Flo_samples = SS_Flo.randomColumn().sort('random').limit(n_samples_Flo);
    var SS_FlC_samples = SS_FlC.randomColumn().sort('random').limit(n_samples_FlC);
    var SS_FlA_samples = SS_FlA.randomColumn().sort('random').limit(n_samples_FlA);
    var SS_PlF_samples = SS_PlF.randomColumn().sort('random').limit(n_samples_PlF);
    var SS_Umi_samples = SS_Umi.randomColumn().sort('random').limit(n_samples_Umi);
    var SS_Cam_samples = SS_Cam.randomColumn().sort('random').limit(n_samples_Cam);
    var SS_Pas_samples = SS_Pas.randomColumn().sort('random').limit(n_samples_Pas);
    var SS_Agr_samples = SS_Agr.randomColumn().sort('random').limit(n_samples_Agr);
    var SS_AgP_samples = SS_AgP.randomColumn().sort('random').limit(n_samples_AgP);
    var SS_Anv_samples = SS_Anv.randomColumn().sort('random').limit(n_samples_Anv);
    var SS_Agu_samples = SS_Agu.randomColumn().sort('random').limit(n_samples_Agu);

    if (bioma == "PAMPAARGENTINA"){
    //crea una variable con todas las muestras estables, diferenciando las clases por pais
        var balanced = SS_FlA_samples
            .merge(SS_FlC_samples)
            .merge(SS_PlF_samples)
            .merge(SS_Umi_samples)
            .merge(SS_Cam_samples)
            .merge(SS_Pas_samples)
            .merge(SS_Agr_samples)            
            .merge(SS_Anv_samples)
            .merge(SS_Agu_samples)
    
     n_amostas = n_amostas.set(String(year),[
      SS_FlC_samples.size().subtract(n_samples_FlC),
      SS_FlA_samples.size().subtract(n_samples_FlA),
      SS_PlF_samples.size().subtract(n_samples_PlF),      
      SS_Umi_samples.size().subtract(n_samples_Umi),
      SS_Cam_samples.size().subtract(n_samples_Cam),
      SS_Pas_samples.size().subtract(n_samples_Pas),
      SS_Agr_samples.size().subtract(n_samples_Agr),
      SS_Anv_samples.size().subtract(n_samples_Anv),
      SS_Agu_samples.size().subtract(n_samples_Agu)])
       }    
       
       if (bioma == "PAMPAURUGUAY"){
    //crea una variable con todas las muestras estables, diferenciando las clases por pais
        var balanced = SS_Flo_samples
            .merge(SS_PlF_samples)
            .merge(SS_Umi_samples)
            .merge(SS_Cam_samples)
            .merge(SS_AgP_samples)
            .merge(SS_Anv_samples)
            .merge(SS_Agu_samples)
    
     n_amostas = n_amostas.set(String(year),[
      SS_Flo_samples.size().subtract(n_samples_Flo),
      SS_PlF_samples.size().subtract(n_samples_PlF),      
      SS_Umi_samples.size().subtract(n_samples_Umi),
      SS_Cam_samples.size().subtract(n_samples_Cam),
      SS_AgP_samples.size().subtract(n_samples_AgP),
      SS_Anv_samples.size().subtract(n_samples_Anv),
      SS_Agu_samples.size().subtract(n_samples_Agu)])
       }
       
var input_mosaic =   mosaics.filterMetadata('year', 'equals', year)
                    //  .filterBounds(limite)
                      .mosaic()
print('input_mosaic', input_mosaic)
  if (year == 1985){//usa el valor del a??o como amplitud
      var max3anos = input_mosaic.select('ndvi_median_wet')
      var min3anos = input_mosaic.select('ndvi_median_dry')
      var amp3anos = max3anos.subtract(min3anos).rename('amp_ndvi_3anos')
  }
  if (year == 1986){//usa los dos a??os anteriores como amplitud
   var mosaico1ano_antes = mosaics.filterMetadata('year', 'equals', ( year - 1))
                    .filterBounds(limite)
                    .mosaic()
   var min3anos = ee.ImageCollection.fromImages([input_mosaic.select('ndvi_median_dry'),
                                                mosaico1ano_antes.select('ndvi_median_dry')]).min()
    var max3anos = ee.ImageCollection.fromImages([input_mosaic.select('ndvi_median_wet'),
                                                mosaico1ano_antes.select('ndvi_median_wet')]).max()
    var amp3anos = max3anos.subtract(min3anos).rename('amp_ndvi_3anos')

 
  }
  if (year > 1986){
    var mosaico1ano_antes = mosaics.filterMetadata('year', 'equals', ( year - 1))
                    .filterBounds(limite)
                    .mosaic()
    var mosaico2anos_antes = mosaics.filterMetadata('year', 'equals', ( year - 2))
                    .filterBounds(limite)
                    .mosaic()
    var min3anos = ee.ImageCollection.fromImages([input_mosaic.select('ndvi_median_dry'),
                                                mosaico1ano_antes.select('ndvi_median_dry'),
                                                mosaico2anos_antes.select('ndvi_median_dry')]).min()
    var max3anos = ee.ImageCollection.fromImages([input_mosaic.select('ndvi_median_wet'),
                                                mosaico1ano_antes.select('ndvi_median_wet'),
                                                mosaico2anos_antes.select('ndvi_median_wet')]).max()
  }
  
  var ndvi_a_3y = max3anos.subtract(min3anos).rename('ndvi_amp_3y')
  
  var ll = ee.Image.pixelLonLat().clip(myRegion)
  var long = ll.select('longitude').add(0).multiply(-1).multiply(1000).toInt16()
  var lati = ll.select('latitude').add(0).multiply(-1).multiply(1000).toInt16()
  
  input_mosaic = input_mosaic.addBands(long.rename('longitude'))
  input_mosaic = input_mosaic.addBands(lati.rename('latitude' ))    
  input_mosaic = input_mosaic.addBands(ndvi_a_3y)    
 // input_mosaic = input_mosaic.addBands(ee.List(year), "year")
  
  
  input_mosaic = input_mosaic.select(bandNames,bandNamesShort)
// Genera "on the fly" el feature space de las complementarias para un a??o dado.
var features_space_complementarias = function(fc, year){

                          
  return input_mosaic.reduceRegions({
          collection: ee.FeatureCollection(fc), 
          reducer: ee.Reducer.first().forEach(input_mosaic.bandNames()), 
          scale: 30, 
          tileScale: 4})
          .map(function(f){return f.set("year", year)})
          
}
  
  complementarias = features_space_complementarias(complementarias, year);
   
   var train = balanced
 
   train = train.merge(complementarias)


    var SS_Flo2 = train.filterMetadata('reference', 'equals', 2)
    var SS_FlC2 = train.filterMetadata('reference', 'equals', 3)
    var SS_FlA2 = train.filterMetadata('reference', 'equals', 4)
    var SS_PlF2 = train.filterMetadata('reference', 'equals', 9)
    var SS_Umi2 = train.filterMetadata('reference', 'equals', 11)
    var SS_Cam2 = train.filterMetadata('reference', 'equals', 12)
    var SS_Pas2 = train.filterMetadata('reference', 'equals', 15)
    var SS_Agr2 = train.filterMetadata('reference', 'equals', 18)
    var SS_AgP2 = train.filterMetadata('reference', 'equals', 21)
    var SS_Anv2 = train.filterMetadata('reference', 'equals', 22)
    var SS_Agu2 = train.filterMetadata('reference', 'equals', 33)

 if (bioma == "PAMPAARGENTINA"){
       n_amostas2 = n_amostas2.set(String(year),[
      SS_FlC2.size(),
      SS_FlA2.size(),
      SS_PlF2.size(),      
      SS_Umi2.size(),
      SS_Cam2.size(),
      SS_Pas2.size(),
      SS_Agr2.size(),
      SS_Anv2.size(),
      SS_Agu2.size()])}
   if (bioma == "PAMPAURUGUAY"){
       n_amostas2 = n_amostas2.set(String(year),[
      SS_Flo2.size(),
   //   SS_FlC2.size(),
    //  SS_FlA2.size(),
      SS_PlF2.size(),      
      SS_Umi2.size(),
      SS_Cam2.size(),
    //  SS_Pas2.size(),
    //  SS_Agr2.size(),
      SS_AgP2.size(),
      SS_Anv2.size(),
      SS_Agu2.size()])}

if (cant_muestras == 1){
  print("Cantidad de muestras por clase " + year + " En orden ascendente, en properties", n_amostas2 )
}
    
  var bands = input_mosaic.bandNames()
  // Se entrena el RF
  var rf_fit = ee.Classifier.smileRandomForest(nro_arboles).train(train, target, bands);
  

  // Se clasifica el a??o y la zona
  var clasificacion = input_mosaic.classify(rf_fit);
  clasificacion = clasificacion.set( "year", year )
                               .set( "zona", id_zona )
                               .set( "version", version_clasificacion )
  
  // Se exporta la clasificaci??n individual                             
  if (bioma == "PAMPAARGENTINA"){
  Export.image.toAsset({
    image: clasificacion, 
    description: "clasificacion-" + year + "-" + id_zona + "-" + version_clasificacion, 
    assetId: output + "clasificacion-" + year +"-"+ id_zona + "-" + version_clasificacion, 
    pyramidingPolicy: {".default": "mode"}, 
    region: ee.Feature(zonas.filter(ee.Filter.eq("idZona", id_zona)).first()).geometry(), 
    scale: 30,
    maxPixels: 1e13})}
  if (bioma == "PAMPAURUGUAY"){
  Export.image.toAsset({
    image: clasificacion, 
    description: "clasificacion-" + year + "-" + id_zona + "-" + version_clasificacion, 
    assetId: output + "clasificacion-" + year +"-"+ id_zona + "-" + version_clasificacion, 
    pyramidingPolicy: {".default": "mode"}, 
    region: ee.Feature(zonas.filter(ee.Filter.eq("ECOZONA", id_zona)).first()).geometry(), 
    scale: 30,
    maxPixels: 1e13})}
  
  // La primera vez cuando es null se asigna la clasificaci??n del 1er a??o y luego se agrega la banda para los a??os siguientes
  clasificacion_completa = clasificacion_completa === null?clasificacion_completa=clasificacion.rename("classification_" + year):clasificacion_completa.addBands(clasificacion.rename("classification_" + year));
  
}) // BUCLE PRINCIPAL POR A??OS: FIN

  if (calcula_acuracia == 1){
    if (bioma == "PAMPAARGENTINA"){
    var acura_region = require('users/schirmbeckj/PampaTriNacional:Colecion_01/passo010_acuracia_class_2017_Pampa_Regioes_AR_func.js').acura_region;
    }
    if (bioma == "PAMPAURUGUAY"){
    var acura_region = require('users/schirmbeckj/PampaTriNacional:Colecion_01/passo010_acuracia_class_2017_Pampa_Regioes_UY_func.js').acura_region;
    }
    var acc = acura_region(clasificacion_completa.select('classification_' + year_acuracia) ,myRegion,conf_mat) 
  }

  if (calcula_area == 1){
        // get raster with area km2
    var pixelArea = ee.Image.pixelArea().divide(1000000);
    /**
     * Helper function
     * @param item 
     */
    var convert2featCollection = function (item) {
        item = ee.Dictionary(item);
        var feature = ee.Feature(ee.Geometry.Point([0, 0]))
            .set('classe', item.get('classe'))
            .set('area', item.get('sum'));
        return feature;
    };
   /**
     * Calculate area crossing a cover map (deforestation, mapbiomas)
     * and a region map (states, biomes, municipalites)
     * @param image 
     * @param geometry
     */
    var calculateArea = function (image, geometry) {
        var reducer = ee.Reducer.sum().group(1, 'classe');
        var areas = pixelArea.addBands(image)
            .reduceRegion({
                reducer: reducer,
                geometry: geometry,
                scale: 120,
                maxPixels: 1e12,
                tileScale:4
            });
        var year = ee.Number(image.get('year'));
        areas = ee.List(areas.get('groups')).map(convert2featCollection);
        areas = ee.FeatureCollection(areas);
        return areas;
    };
    // get raster with area km2
    var areas = calculateArea(clasificacion_completa.select('classification_' + year_calcula_area).selfMask(), myRegion)
        .map(
            function(feature){
                return feature.set('year', String(year_calcula_area));
            }
        );
    if (bioma == "PAMPAARGENTINA"){
    print('??rea en km2 de Bosque Cerrado(03), a??o ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals', 3).first().get('area'))
    print('??rea en km2 de Bosque Abierto(04), a??o ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals', 4).first().get('area'))
    print('??rea en km2 de Plantaciones Forestales(09), a??o ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals',9).first().get('area'))
    print('??rea en km2 de Area Humeda(11) a??o ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals',11).first().get('area'))
    print('??rea en km2 de Pastizal(12) a??o ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals',12).first().get('area'))
    print('??rea en km2 de Pastura(15) a??o ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals',15).first().get('area'))
    print('??rea en km2 de Agricultura(18) a??o ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals',18).first().get('area'))
    print('??rea en km2 de Area No Vegetada(22) a??o: ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals',22).first().get('area'))
    print('??rea en km2 de Agua(33) a??o: ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals',33).first().get('area'))
    }    
    if (bioma == "PAMPAURUGUAY"){
    print('??rea en km2 de Bosque(02), a??o ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals', 2).first().get('area'))
    print('??rea en km2 de Plantaciones Forestales(09), a??o ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals',9).first().get('area'))
    print('??rea en km2 de Area Humeda(11) a??o ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals',11).first().get('area'))
    print('??rea en km2 de Pastizal(12) a??o ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals',12).first().get('area'))
    print('??rea en km2 de Agricultura-Pastura(21) a??o: ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals',21).first().get('area'))
    print('??rea en km2 de Area No Vegetada(22) a??o: ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals',22).first().get('area'))
    print('??rea en km2 de Agua(33) a??o: ' + year_calcula_area +  ' ' , areas.filterMetadata('classe','equals',33).first().get('area'))
    }
      
    }
  



// --------------------------------------
//  APP: Controles de gr??ficos y leyenda
// --------------------------------------
var app = {
  
  flag_plot_enable: false,
  
  year_default : '' + year_fin ,
  bioma: bioma,
  //coleccion1_Arg : ee.ImageCollection ('projects/MapBiomas_Pampa/WORKSPACE/Argentina/clasificacion-Col1-sin-Filtros-Arg'),
  //coleccion1_Uy : ee.ImageCollection('projects/MapBiomas_Pampa/WORKSPACE/Uruguay/IC_Clasificaciones'),
  limite: limite,
  plot: ts.plots.ts_landsat, // Objeto plot
  
  current_year: null,
  
  leyenda : {
    2  :{label:"N2_Bosque", color:"#1f4423"},
    3  :{label:"N3_Bosque_cerrado", color:"#006400"},
    4  :{label:"N3_Bosque_abierto", color:"#32cd32"},
    9  :{label:"N2_Plantaciones_forestales", color:"#935132"},
    11 :{label:"N2_Area_humeda_natural", color:"#45c2a5"},
    12 :{label:"N2_Pastizal", color:"#b8af4f"},
    15 :{label:"N2_Pastura", color:"#ffd966"},
    18 :{label:"N2_Agricultura", color:"#e974ed"},
    21 :{label:"N2_Agricultura_Pastura", color:"#ffefc3"},
    22 :{label:"N2_Area_no_vegetada", color:"#ea9999"},
    33 :{label:"N2_Cuerpos_de_agua", color:"#0000ff"},
    },

  // Plot config 
  params: {
    start: "1985-01-01",
    end: "2022-04-01",
    geom: null,
    
    index: "ndvi",
    
    cloud_cover: 10,
    
    options:{
      title: "NDVI time series",
      subtitle: ""
    }
  },
  
  activate: function(v){
    app.flag_plot_enable = !app.flag_plot_enable;
    app.panel_plot.widgets().reset([]);
  },
  

  on_map_click: function(p){
    if(app.flag_plot_enable){
      var point = ee.Geometry.Point([p.lon, p.lat])
      app.params.geom = point
      
      app.params.options.subtitle = "A??o: " + app.current_year
      
      app.panel_plot.widgets().reset([app.plot.get(app.params)]);
      if (app.current_year >= 2000 && app.current_year <= 2019) {    
        Map.layers().reset([
          Map.layers().get(0), //Mosaic
          Map.layers().get(1), //colecion 1
          Map.layers().get(2), //diference
          Map.layers().get(3), //Clasificacion
          Map.layers().get(4), //region
          ui.Map.Layer(ee.Feature(point,null), {color:"yellow"}, "Inspect", true) // OnClick
          
        ])
      } else {
        Map.layers().reset([
          Map.layers().get(0), //Mosaic
          Map.layers().get(1), // Clasificacion
          Map.layers().get(2), //region
          ui.Map.Layer(ee.Feature(point,null), {color:"yellow"}, "Inspect", true) // OnClick
          
        ])
      }
    }
  },
  
  make_row: function(color, name) {
    // Create the label that is actually the colored box.
    var colorBox = ui.Label({
      style: {
        backgroundColor: color,
        // Use padding to give the box height and width.
        padding: '8px',
        margin: '0 0 4px 0'
      }
    });
  
    // Create the label filled with the description text.
    var description = ui.Label({
      value: name,
      style: {margin: '0 0 4px 6px'}
    });
  
    return ui.Panel({
      widgets: [colorBox, description],
      layout: ui.Panel.Layout.Flow('horizontal')
    });
  },
  
  add_legend: function(){
    for(var x in app.leyenda) {
      var obj = app.leyenda[x]
      app.panel_legend.add(app.make_row(obj.color, "("+x+") " + obj.label))
    }
  },
  
  mosaic_change: function(year){
    
    app.current_year = year;
    
    var input_mosaic = mosaics
            .filterMetadata('version', 'equals', version_mosaico)
            .filterMetadata('year', 'equals', parseInt(year))
            .mosaic()
    

    
    var mosaic = ui.Map.Layer(input_mosaic, RGBvis, "RGB " + year, true)
    //var limite = ee.Feature(zonas.filter(ee.Filter.eq("idZona", id_zona)).first()).geometry()
    vis_class.bands = ["classification_" + year]
    var clasificacion = ui.Map.Layer(clasificacion_completa.clip(app.limite), vis_class, "Clasificaci??n " + year, true);
    var region2 = ui.Map.Layer(region.style({fillColor: "FF000000"}) , {},"Region")
    var point_init = ui.Map.Layer(ee.Feature( ee.Geometry.Point([0,0]), null), {color:"yellow"}, "Inspect", true);
    var lim2 = ui.Map.Layer(app.limite , {},"Limite2")
    if (year >= 2000 && year <= 2019) {
      
    if (bioma =="PAMPAARGENTINA"){
     var coleccion1 = app.coleccion1_Arg.filter(ee.Filter.eq("region_name",id_zona))
                                   //.filter(ee.Filter.eq("version","2"))
                                   .select('classification_'+ year)
                                   .mosaic()
    }

    if (bioma == "PAMPAURUGUAY"){
      var coleccion1 = app.coleccion1_Uy.filter(ee.Filter.eq("region_name",id_zona))
                                  // .filter(ee.Filter.eq("version","2"))
                                   .select('classification_'+ year)
                                   .mosaic()
    }
  //  var img_dif = diferenca(coleccion1,
  //              clasificacion_completa.clip(app.limite).select('classification_' + year),
  //              clase_diferencia, false)
  //  var diference = ui.Map.Layer(img_dif,vischange,'Diferencia de la clase ' + String(clase_diferencia) + ' ' + String(year),false)
  //  var collection1_layer = ui.Map.Layer(coleccion1, vis_class, "Colecion 1 " + year, true);
    
    Map.layers().reset([
        mosaic,
        collection1_layer,
        clasificacion, // Clasificacion
        diference, //Diferencia
        region2,
        Map.layers().length() >= 4? Map.layers().get(4):point_init, // Inspect
      ])
    } else{
         Map.layers().reset([
        mosaic,
        clasificacion, // Clasificacion
        //diference, //Diferencia
        region2,
        Map.layers().length() >= 4? Map.layers().get(4):point_init, // Inspect
      ]) 
    }
  },
  
  // Visual Interface
  panel_main: ui.Panel([], ui.Panel.Layout.Flow("vertical"), {position: "bottom-right"}),
  panel_legend: ui.Panel([], ui.Panel.Layout.Flow("vertical"), {position: "top-left"}),
  panel_plot: ui.Panel([], ui.Panel.Layout.Flow("horizontal")),
  chk_plot: ui.Checkbox("Activar serie temporal", false, function(v){app.activate(v)}, false, {border: "1px", padding: "5px"}),
  lst_years: ui.Select(years.map(function(n){return "" + n}), "Mosaico A??o... ", null, function(v){app.mosaic_change(v)}, false, {}),
  lbl_current_class: ui.Label(""),
  
  init: function(){
    app.panel_main.add(app.panel_plot);
    app.panel_main.add(app.chk_plot);
    app.panel_main.add(app.lbl_current_class);
    app.panel_main.add(app.lst_years);
    app.lst_years.setValue(app.year_default, true)    
    Map.add(app.panel_main)
    Map.add(app.panel_legend)
    Map.onClick(app.on_map_click)
    
    app.add_legend();
    
  }
  
  
}
app.init()

Map.setOptions("HYBRID")

