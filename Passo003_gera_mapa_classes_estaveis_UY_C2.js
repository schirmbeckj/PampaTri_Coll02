/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var pampa = 
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
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var version = '1'  

var assetMosaics =  'projects/MapBiomas_Pampa/MOSAICS/mosaics_c1';
//var assetBiomes = 'projects/mapbiomas-workspace/AUXILIAR/biomas-raster';
var dirout = 'projects/MapBiomas_Pampa/SAMPLES/C2/URUGUAY/'
var regioesCollection = ee.FeatureCollection('projects/MapBiomas_Pampa/WORKSPACE/Uruguay/RegionesUy')
//var region = ['sedimentaria_Oeste']

var palettes = require('users/mapbiomas/modules:Palettes.js');
//var biomes = ee.Image(assetBiomes);

var vis = {
    'bands': ['reference'],
    'min': 0,
    'max': 34,
    'palette': palettes.get('classification2')
};

var colecao = ee.ImageCollection('projects/MapBiomas_Pampa/WORKSPACE/Uruguay/IC_Clasificacion_final') 
      .min()
      
print('colecao',colecao) 

//colecao = ee.Image(colecao.filterMetadata('region_name','equals',region).first()).select('classification_2019')

//print('colecao',colecao)   
//colecao = colecao.mask(biomes.eq(2))
var vis = {
    'bands': ['classification_2019' ],
    'min': 0,
    'max': 34,
    'palette': palettes.get('classification2')
};
Map.addLayer(colecao, vis,'colecao')

var colList = ee.List([])

var colremap = colecao.select('classification_2000').remap(
          [ 2, 3, 4, 9, 11, 12, 15, 18, 21, 22, 33],
          [ 2, 3, 4, 9, 11, 12, 15, 18, 21, 22, 33])
colList = colList.add(colremap.int8())

var anos = ['2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019'];
for (var i_ano=0;i_ano<anos.length; i_ano++){
  var ano = anos[i_ano];

  var colflor = colecao.select('classification_'+ano).remap(
          [ 2, 3, 4, 9, 11, 12, 15, 18, 21, 22, 33],
          [ 2, 3, 4, 9, 11, 12, 15, 18, 21, 22, 33])

  colList = colList.add(colflor.int8())
};

var collection = ee.ImageCollection(colList)
//print(collection)
//Map.addLayer(collection)

var unique = function(arr) {
    var u = {},
        a = [];
    for (var i = 0, l = arr.length; i < l; ++i) {
        if (!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
};

/**
 * REFERENCE MAP
 */

var getFrenquencyMask = function(collection, classId) {

    var classIdInt = parseInt(classId, 10);

    var maskCollection = collection.map(function(image) {
        return image.eq(classIdInt);
    });

    var frequency = maskCollection.reduce(ee.Reducer.sum());

    var frequencyMask = frequency.gte(classFrequency[classId])
        .multiply(classIdInt)
        .toByte();

    frequencyMask = frequencyMask.mask(frequencyMask.eq(classIdInt));

    return frequencyMask.rename('frequency').set('class_id', classId);
};
///////////////////////////
//FUNCTION: LOOP for each carta

var lista_image = ee.List([]);

//var classFrequency = { "2": 20, "9": 16, "11": 14, "12": 20, "21": 18, "22": 16, "33": 20}


var classFrequency = { "2": 20, "9": 16, 
                      "11": 16, "12": 18, 
                      "21": 18, "22": 16, 
                      "33": 20}

//print(Object.keys(classFrequency))

var frequencyMasks = Object.keys(classFrequency).map(function(classId) {
    return getFrenquencyMask(collection, classId);
});

frequencyMasks = ee.ImageCollection.fromImages(frequencyMasks);

var referenceMap = frequencyMasks.reduce(ee.Reducer.firstNonNull()).clip(pampa);

referenceMap = referenceMap.mask(referenceMap.neq(27)).rename("reference");

var vis = {
    'bands': ['reference'],
    'min': 0,
    'max': 34,
    'palette': palettes.get('classification2')
};


Map.addLayer(referenceMap, vis, 'Classes persistentes 2000 a 19', true);

Export.image.toAsset({
    "image": referenceMap.toInt8(),
    "description": 'Pampa_amostras_estaveis_00a19_Uruguay_C2',
    "assetId": dirout + 'Pampa_amostras_estaveis_00a19_v02_Uruguay_C2',
    "scale": 30,
    "pyramidingPolicy": {
        '.default': 'mode'
    },
    "maxPixels": 1e13,
    "region": pampa
});  

var blank = ee.Image(0).mask(0);
var outline = blank.paint(regioesCollection, 'AA0000', 2); 
var visPar = {'palette':'000000','opacity': 0.6};
Map.addLayer(outline, visPar, 'Regiao', true);