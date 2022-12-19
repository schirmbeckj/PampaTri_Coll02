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
var col = '7'
var bioma = "PAMPA"
var versionOut = '034_final_com_filtro'

var dir = 'projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_Pruebas_Clasificaciones_UV'
//var dir = 'projects/mapbiomas-workspace/AMOSTRAS/col' + col + '/PAMPA/class_col' + col
                   
  ee.ImageCollection([ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_Pruebas_Clasificaciones_UV/class_1_class_v_2'),
             ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_Pruebas_Clasificaciones_UV/class_2_class_v_2'),
             ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_Pruebas_Clasificaciones_UV/class_3_class_v_1'),
             ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_Pruebas_Clasificaciones_UV/class_4_class_v_2'),
             ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_Pruebas_Clasificaciones_UV/class_5_class_v_1'),
             ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_Pruebas_Clasificaciones_UV/class_6_class_v_1'),
             ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_Pruebas_Clasificaciones_UV/class_7_class_v_1'),
             ee.Image('projecit/MapBiomas_Pampa/WORKSPACE/Argentina/IC_Pruebas_Clasificaciones_UV/class_8_class_v_1'),
             ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_Pruebas_Clasificaciones_UV/class_9_class_v_1')])

                   
                   
var collection = ee.ImageCollection([
                 ee.Image(dir + '/class_1_class_v_2'),
                 ee.Image(dir + '/class_2_class_v_2'),
                 ee.Image(dir + '/class_3_class_v_1'),
                 ee.Image(dir + '/04_RF85a21_v034_final'),
                 ee.Image(dir + '/05_RF85a21_v033_final'),
                 ee.Image(dir + '/06_RF85a21_v033b_final'),
                 ee.Image(dir + '/07_RF85a21_v033b_final')])

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
  'description': bioma + '_' + versionOut,
  'assetId': out + bioma + '_' + versionOut,
  'pyramidingPolicy': {
      '.default': 'mode'
  },
  'region': geometryPampa,
  'scale': 30,
  'maxPixels': 1e13
});

