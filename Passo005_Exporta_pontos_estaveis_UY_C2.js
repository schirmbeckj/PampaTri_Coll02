
// AUTHOR: Juliano Schirmbeck
// DATE: nov 2020

var limite_PAMPA = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-58.89903243473292, -33.90945759789922],
          [-58.16280033456499, -34.499816860847936],
          [-57.2862137727395, -34.79490451623124],
          [-55.19834373490166, -35.44914265276266],
          [-53.765088158901605, -34.46740051239218],
          [-53.17125331408759, -33.65836262321688],
          [-52.8934190863683, -32.811213773068836],
          [-53.50937251712497, -32.03185386133755],
          [-54.8003634592565, -31.06489845827693],
          [-56.10117941688713, -30.162803430416954],
          [-57.67702021839042, -29.826468649902285],
          [-58.21360234939319, -30.66900608099251],
          [-58.49497045967579, -31.812411235606]]]);
          

var bioma = "PAMPAURUGUAY";

var versao = 'v01'
var nSamples = 2000;

var sufixName = ''

//var dirsamples = ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Uruguay/Pampa_amostras_estaveis_00a19_v02')
var dirsamples = ee.Image('projects/MapBiomas_Pampa/SAMPLES/C2/URUGUAY/Pampa_amostras_estaveis_00a19_v02_Uruguay_C2')

//var dirout = 'projects/MapBiomas_Pampa/SAMPLES/C1/Estaveis/Uruguay/';
var dirout = 'projects/MapBiomas_Pampa/SAMPLES/C2/URUGUAY/'
var regioesCollection = ee.FeatureCollection('projects/MapBiomas_Pampa/ANCILLARY_DATA/RegionesUy_Buf')


var palettes = require('users/mapbiomas/modules:Palettes.js');

var vis = {
    'bands': ['reference'],
    'min': 0,
    'max': 34,
    'palette': palettes.get('classification2')
};
Map.addLayer(dirsamples, vis, 'Classes persistentes 00 a 19', true);

print(regioesCollection)

////////////////////////////////////////////////////////
var getTrainingSamples = function (feature) {
  var regiao = feature.get('ECOZONA');
  //print(regiao)
  var num_train_02 = nSamples
  var num_train_03 = nSamples
  var num_train_04 = nSamples
  var num_train_09 = nSamples*2
  var num_train_11 = nSamples
  var num_train_12 = nSamples
  var num_train_15 = nSamples
  var num_train_18 = nSamples
  var num_train_21 = nSamples*2
  var num_train_22 = nSamples
  var num_train_33 = nSamples
  

  var clippedGrid = ee.Feature(feature).geometry()

  var referenceMap =  dirsamples.clip(clippedGrid);
  //Map.addLayer(referenceMap,vis)
                      
  var training = referenceMap.stratifiedSample({scale:30, classBand: 'reference', numPoints: 0, region: feature.geometry(), seed: 1, geometries: true,
           classValues: [2, 3, 4, 9, 11, 12, 15, 18, 21, 22, 33], 
           classPoints: [num_train_02,
                         num_train_03,
                         num_train_04,
                         num_train_09,
                         num_train_11,
                         num_train_12,
                         num_train_15,
                         num_train_18,
                         num_train_21,
                         num_train_22,
                         num_train_33]
  });

  training = training.map(function(feat) {return feat.set({'ECOZONA': regiao})});
  return training;
 };

var mySamples = regioesCollection.map(getTrainingSamples).flatten();

Map.addLayer(mySamples)

print(mySamples.first())
print(mySamples.limit(1))


//Export.table.toAsset(mySamples,
//  'samples_preclass_' + bioma + '_2000_'  + versao,
//  dirout + 'samples_preclass_' + bioma + '_2000_'  + versao)
  
Export.table.toAsset(mySamples,
  'samples_C2_' + bioma + '_'  + versao,
  dirout + 'samples_C2_' + bioma + '_'  + versao)
  
