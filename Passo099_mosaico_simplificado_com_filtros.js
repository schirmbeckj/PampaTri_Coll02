/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometryPampa = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-58.235066877772624, -30.60692415433937],
          [-55.3812292750718, -31.536184439107085],
          [-53.357137190272624, -34.05923401863392],
          [-49.577840315272624, -30.17098716535918],
          [-49.865449044187244, -29.047801031923346],
          [-50.496256143190635, -28.306864654328834],
          [-52.082723127772624, -27.242150238166413],
          [-53.84697511154161, -27.06728423431273],
          [-55.620320784022624, -27.807229402344642]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
 
var ano = '2021'
var version = '032_final'


var col = '7'
var bioma = "PAMPA"
var versionOut = 'com_filtro'

var dir = 'projects/mapbiomas-workspace/AMOSTRAS/col' + col + '/PAMPA/class_col' + col + '_filtros'
//var dir = 'projects/mapbiomas-workspace/AMOSTRAS/col' + col + '/PAMPA/class_col' + col
                   
var collection = ee.ImageCollection([
                 ee.Image(dir + '/01_RF85a21_v' + version),
                 ee.Image(dir + '/02_RF85a21_v' + version),
                 ee.Image(dir + '/03_RF85a21_v' + version),
                 ee.Image(dir + '/04_RF85a21_v' + version),
                 ee.Image(dir + '/05_RF85a21_v' + version),
                 ee.Image(dir + '/06_RF85a21_v' + version),
                 ee.Image(dir + '/07_RF85a21_v' + version)])

//var collection = ee.ImageCollection(dir_filtros)
//                .filter(ee.Filter.eq('version', version))
print(collection)

var image = collection.min()
var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis = { 'bands': ['classification_'+ ano], 'min': 0, 'max': 45,  'palette': palettes.get('classification5')};
Map.addLayer(image, vis, 'Colecao 7 - ')


var out = 'projects/mapbiomas-workspace/AMOSTRAS/col' + col + '/PAMPA/class_col' + col + '_mosaic/'       

print(image)
//Map.addLayer(image.select(30), vis, 'imagem' );
Export.image.toAsset({
  'image': image,
  'description': bioma + '_' + version + '_' + versionOut,
  'assetId': out + bioma + '_' + version + '_' + versionOut,
  'pyramidingPolicy': {
      '.default': 'mode'
  },
  'region': geometryPampa,
  'scale': 30,
  'maxPixels': 1e13
});

