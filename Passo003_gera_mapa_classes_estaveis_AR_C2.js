/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var pampa = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-63.965852423135, -38.63417041245223],
          [-60.914821924464384, -39.38567261798928],
          [-59.62668860706214, -39.1328709203286],
          [-58.41163503131993, -38.809580687992494],
          [-57.3953864224772, -38.354251859612276],
          [-56.85071666305975, -37.842593078584535],
          [-56.38832693819856, -37.031934716850486],
          [-56.32259434456855, -36.16616648902279],
          [-56.81323878035734, -35.40640521293939],
          [-57.71662835683517, -34.014096037452845],
          [-57.232124754359816, -31.922038336651326],
          [-56.81776675157934, -30.649501507285635],
          [-57.54259727927231, -29.829921357264602],
          [-60.91508764376527, -30.03035473119208],
          [-65.0537923314058, -31.345275014730895],
          [-66.8433306807844, -33.018685810529206],
          [-67.6670415217956, -35.79531781038757],
          [-66.50190528796955, -37.96902120394063]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var version = '1_l' 

//var regions_name = ['1','2','3','4,','5','6','7','8','9']
//var region = '1'; var classFrequency = { "3": 20,  "4": 18, "11": 15, "12": 20, "15": 18, "18": 15, "22": 14, "33": 17}
//var region = '2'; var classFrequency = { "3": 20,  "4": 18, "11": 15, "12": 20, "15": 18, "18": 15, "22": 14, "33": 17}
//var region = '3'; var classFrequency = { "3": 20,  "4": 18, "11": 15, "12": 20, "15": 18, "18": 15, "22": 14, "33": 17}
var region = '6'; var classFrequency = { "3": 20,  "4": 18, "11": 15, "12": 20, "15": 18, "18": 15, "22": 14, "33": 17}


var dirout = 'projects/MapBiomas_Pampa/SAMPLES/C2/ARGENTINA'


var regioesCollection = ee.FeatureCollection('projects/MapBiomas_Pampa/ANCILLARY_DATA/Zonas_Pampa_ARG_buffer10km_Zona4manual')
//var limite = regions.filterMetadata('idZona', 'equals', region)
//var geometry = limite.geometry();

print(regioesCollection)

var palettes = require('users/mapbiomas/modules:Palettes.js');
//var biomes = ee.Image(assetBiomes);

var VF1= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_class_col1_filtros/class_1_class_v_1_freq')
var VF2= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_class_col1_filtros/class_2_class_v_2_freq')
var VF3= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_class_col1_filtros/class_3_class_v_2_freq')
var VF4= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_class_col1_filtros/class_4_class_v_2_freq')
var VF5= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_class_col1_filtros/class_5_class_v_1_filtPz')
var VF6= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_class_col1_filtros/class_6_class_v_1_filtPz')
var VF7= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_class_col1_filtros/class_7_class_v_1_filtPz')
var VF8= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_class_col1_filtros/class_8_class_v_1_filtPz')
var VF9= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/Argentina/IC_class_col1_filtros/class_9_class_v_1_filtPz')

var col02=ee.ImageCollection([VF1, VF2, VF3, VF4, VF5, VF6, VF7, VF8, VF9])//.min()

var colecao = col02.filterMetadata('region_name','equals',region).min()
print('input',colecao)

var vis = {
    'bands': 'classification_2019',
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

  var colflor = colecao.select('classification_' + ano).remap(
          [ 2, 3, 4, 9, 11, 12, 15, 18, 21, 22, 33],
          [ 2, 3, 4, 9, 11, 12, 15, 18, 21, 22, 33])
  colList = colList.add(colflor.int8())
};

var collection = ee.ImageCollection(colList)

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

//var classFrequency = { "2": 18,  "3": 18,  "4": 18, 
//                       "9": 18, "11": 18, "12": 18,
//                      "15": 18, "18": 18, "21": 18, 
//                      "22": 18, "33": 18}

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

referenceMap = referenceMap.set('region_code', region)

Export.image.toAsset({
    "image": referenceMap.toInt8(),
    "description": 'Pampa_amostras_estaveis_00a19_Argentina_C2_region_' + region,
    "assetId": dirout + 'Pampa_amostras_estaveis_00a19_Argentina_C2_region_' + region,
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