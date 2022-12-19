
// AUTHOR: Juliano Schirmbeck
// DATE: fev 2021 

var bioma = "PAMPAARGENTINA";

var versao = 'v01_85_99'
var nSamples = 2000;

var sufixName = ''

//var dirsamples = ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/Pampa_amostras_estaveis_00a19')
var dirsamples = ee.ImageCollection('projects/MapBiomas_Pampa/SAMPLES/C2/ARGENTINA/STABLE85_99').min()

print('dirsamples',dirsamples)
//Map.addLayer(dirsamples)

var dirout = 'projects/MapBiomas_Pampa/SAMPLES/C2/ARGENTINA/';

var regioesCollection = ee.FeatureCollection('projects/MapBiomas_Pampa/ANCILLARY_DATA/C2/Zonas_ARG_C2_conbuffer')
print(regioesCollection)

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
  var regiao = feature.get('idZona');
  //print(regiao)
  var num_train_02 = nSamples
  var num_train_03 = nSamples
  var num_train_04 = nSamples
  var num_train_09 = nSamples
  var num_train_11 = nSamples
  var num_train_12 = nSamples
  var num_train_15 = nSamples
  var num_train_18 = nSamples
  var num_train_21 = nSamples
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

  training = training.map(function(feat) {return feat.set({'idZona': regiao})});
  return training;
 };

var mySamples = regioesCollection.map(getTrainingSamples).flatten();

Map.addLayer(mySamples)

print(mySamples.filterMetadata('reference','equals',3)
               .filterMetadata('idZona','equals','1')
                .size())
//print(mySamples.limit(1))


Export.table.toAsset(mySamples,
  'samples_C2_' + bioma + '_'  + versao,
  dirout + 'samples_C2_' + bioma + '_'  + versao)
  
  
  //var totalSample = ee.FeatureCollection('projects/MapBiomas_Pampa/SAMPLES/C1/Estaveis/Argentina/Year/pontos_exp1_v01_2019')
  //Map.addLayer(totalSample,{'palette':'ff0000'})

