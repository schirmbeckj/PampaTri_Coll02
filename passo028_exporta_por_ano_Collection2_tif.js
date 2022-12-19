/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometryPampa = 
    /* color: #d63000 */
    /* shown: false */
    /* locked: true */
    ee.Geometry.Polygon(
        [[[-57.94189700269892, -30.32632807769348],
          [-58.85067559354591, -30.026163329158244],
          [-60.360154068819845, -30.153416290097393],
          [-63.52354819124128, -31.000938208941918],
          [-64.75624069843683, -32.145642494183704],
          [-64.87925667039367, -32.67393300468354],
          [-66.60303569989078, -32.899302070676065],
          [-66.46278884589357, -33.45328517192076],
          [-66.36322424464728, -33.753747097735214],
          [-66.3951949436497, -34.2002825978092],
          [-66.6652266103554, -34.96479020806534],
          [-66.83150103730325, -35.214496982977025],
          [-67.51148154933519, -35.479560261332495],
          [-66.92205006759492, -36.39230275010934],
          [-66.40689288050777, -37.421371665638276],
          [-65.79470927866656, -37.427130218154375],
          [-65.44453619692285, -37.66670348373145],
          [-65.02566345754249, -38.01653687748366],
          [-64.6992889106695, -38.14779760112225],
          [-64.37209121043801, -38.20037250034731],
          [-63.32090952430868, -38.631165489490286],
          [-62.548734556709235, -39.02518278452478],
          [-60.659716863193744, -39.07808524375365],
          [-59.644023360084546, -38.875512469655106],
          [-58.76197859368429, -38.695164065722494],
          [-57.45395443704034, -38.18174589406905],
          [-57.03011066746685, -37.54561798311757],
          [-56.78852614056122, -37.08322498746212],
          [-56.634466000174065, -36.88570329199664],
          [-56.54702103357629, -36.63533309263388],
          [-56.64093028881674, -36.125341844350736],
          [-56.703032069742505, -35.282743859819746],
          [-56.22934034622058, -35.0020075104931],
          [-55.28921008141821, -35.033264034958435],
          [-54.62403388102669, -34.97824246088198],
          [-53.93941721762937, -34.568468542837955],
          [-53.40428686468099, -34.06517994604445],
          [-52.41847977867869, -33.15357697204292],
          [-51.660986995389436, -32.09785635400345],
          [-50.79189706387495, -31.32463414983378],
          [-50.25770314362929, -30.7776302525357],
          [-49.954461553983975, -30.062871815329398],
          [-49.99478754939923, -29.599790825125137],
          [-52.77381753439109, -29.357260845922053],
          [-52.0640411372308, -28.293365970973586],
          [-52.26716579250129, -27.38965440761786],
          [-53.18070634169047, -27.477778081403518],
          [-54.240275501762596, -27.624671652623814],
          [-55.32153976773817, -27.871461665252802],
          [-56.031007176794, -28.357589426064102],
          [-56.97040538348904, -29.462819610831993]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/**
 * Classe de pos-classificação para reduzir ruídos na imagem classificada
 * 
 * @param {ee.Image} image [eeObjeto imagem de classificação]
 *
 * @example
 * var image = ee.Image("aqui vem a sua imagem");
 * var filterParams = [
 *     {classValue: 1, maxSize: 3},
 *     {classValue: 2, maxSize: 5}, // o tamanho maximo que o mapbiomas está usado é 5
 *     {classValue: 3, maxSize: 5}, // este valor foi definido em reunião
 *     {classValue: 4, maxSize: 3},
 *     ];
 * var pc = new PostClassification(image);
 * var filtered = pc.spatialFilter(filterParams);
 */
var PostClassification = function (image) {

    this.init = function (image) {

        this.image = image;

    };

    var majorityFilter = function (image, params) {

        params = ee.Dictionary(params);
        var maxSize = ee.Number(params.get('maxSize'));
        var classValue = ee.Number(params.get('classValue'));

        // Generate a mask from the class value
        var classMask = image.eq(classValue);

        // Labeling the group of pixels until 100 pixels connected
        var labeled = classMask//.mask(classMask)//.connectedPixelCount(maxSize, true);

        // Select some groups of connected pixels
        var region = labeled//.lt(maxSize);

        // Squared kernel with size shift 1
        // [[p(x-1,y+1), p(x,y+1), p(x+1,y+1)]
        // [ p(x-1,  y), p( x,y ), p(x+1,  y)]
        // [ p(x-1,y-1), p(x,y-1), p(x+1,y-1)]
        var kernel = ee.Kernel.square(5);

        // Find neighborhood
        var neighs = image.neighborhoodToBands(kernel).mask(region);

        // Reduce to majority pixel in neighborhood
        var majority = neighs.reduce(ee.Reducer.mode());

        // Replace original values for new values
        var filtered = image.where(region, majority);

        return filtered.byte();

    };

    /**
     * Método para reclassificar grupos de pixels de mesma classe agrupados
     * @param  {list<dictionary>} filterParams [{classValue: 1, maxSize: 3},{classValue: 2, maxSize: 5}]
     * @return {ee.Image}  Imagem classificada filtrada
     */
    this.spatialFilter = function (filterParams) {

        var image = ee.List(filterParams)
            .iterate(
                function (params, image) {
                    return majorityFilter(ee.Image(image), params);
                },
                this.image
            );

        this.image = ee.Image(image);


        return this.image;

    };

    this.init(image);

};



var dirout = 'projects/MapBiomas_Pampa/COLLECTION2/classification'

var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis5 = { 'min': 0, 'max': 45,  'palette': palettes.get('classification5')};

var limites = ee.FeatureCollection('users/evelezmartin/shp/Pampa_Tri_paises_mosaico_c2')

var ar = limites.filterMetadata('country','equals','Argentina')
ar = ar.first().set('ID',1)
var br = limites.filterMetadata('country','equals','Brasil')
br = br.first().set('ID',2)
var uy = limites.filterMetadata('country','equals','Uruguay')
uy = uy.first().set('ID',3)
var biomes = ee.FeatureCollection([ar,uy,br])

var limitesRaster = ee.Image().uint32().paint({
    featureCollection: biomes,
    color: 'ID'
}).rename(['regiao']);
Map.addLayer(limitesRaster.randomVisualizer(), {}, 'regions - raster',false);

//--------------------------------------------
//
//   Leitura preparação dados brasil
//
//---------------------------------------------------

var dirCol5 = 'projects/mapbiomas-workspace/COLECAO7/integracao';
var biomas = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/biomas_IBGE_250mil')
var region = biomas.filterMetadata('Bioma','equals', 'Pampa')
var biomes = ee.Image('projects/mapbiomas-workspace/AUXILIAR/biomas-raster-41')
var biome = biomes.mask(biomes.eq(6))

var coll_BR = ee.ImageCollection(dirCol5).filterMetadata('version','equals','0-25')
                      .filterBounds(region.geometry()).mosaic().updateMask(biome)

//--------------------------------------------
//
//   Leitura preparação dados Argentina
//
//---------------------------------------------------
var VF1= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/COLLECTION2/ARGENTINA/classification_c2_filtros/PAMPAARGENTINA_col2_Z_1_6_MultiFinal_85-21')
var VF2= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/COLLECTION2/ARGENTINA/classification_c2_filtros/PAMPAARGENTINA_col2_Z_2_6_MultiFinal_85-21')
var VF3= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/COLLECTION2/ARGENTINA/classification_c2_filtros/PAMPAARGENTINA_col2_Z_3_6_MultiFinal_85-21')
var VF4= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/COLLECTION2/ARGENTINA/classification_c2_filtros/PAMPAARGENTINA_col2_Z_4_6_MultiFinal_85-21')
var VF5= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/COLLECTION2/ARGENTINA/classification_c2_filtros/PAMPAARGENTINA_col2_Z_5_6_MultiFinal_85-21')
var VF6= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/COLLECTION2/ARGENTINA/classification_c2_filtros/PAMPAARGENTINA_col2_Z_6_6_MultiFinal_85-21')
var VF7= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/COLLECTION2/ARGENTINA/classification_c2_filtros/PAMPAARGENTINA_col2_Z_7_6_MultiFinal_85-21')
var VF8= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/COLLECTION2/ARGENTINA/classification_c2_filtros/PAMPAARGENTINA_col2_Z_8_6_MultiFinal_85-21')
var VF9= ee.Image('projects/MapBiomas_Pampa/WORKSPACE/COLLECTION2/ARGENTINA/classification_c2_filtros/PAMPAARGENTINA_col2_Z_9_6_MultiFinal_85-21') 

var coll_AR=ee.ImageCollection([VF1, VF2, VF3, VF4, VF5, VF6, VF7, VF8, VF9])


//--------------------------------------------
//
//   Leitura preparação dados Uruguai
//
//---------------------------------------------------
var version = '1'

var coll_UY = ee.ImageCollection('projects/MapBiomas_Pampa/WORKSPACE/COLLECTION2/URUGUAY/IC_C2_Clasificacion_F') 

var regions_nameUY= ['cristalino',
'graben_LM',
'Sierras_Este', 
'sedimentaria_gnw',
'basaltica',
'graben_SL',
'sedimentaria_Oeste'] 

var anos = ['1985','1986','1987','1988','1989','1990',
            '1991','1992','1993','1994','1995','1996',
            '1997','1998','1999','2000','2001','2002',
            '2003','2004','2005','2006','2007','2008',
            '2009','2010','2011','2012','2013','2014',
            '2015',
            '2016','2017','2018','2019','2020',
            '2021'
            ];

var bioma = 'PAMPATRI'
var versaoout = '5'
var bandout = 'classification'
var source = 'PAMPATRI'

for (var i_ano=0;i_ano<anos.length; i_ano++){  
  var ano = anos[i_ano];
  
//dados br
  var out_BR = coll_BR.select('classification_'+ano).remap(
            [ 3, 9, 11, 12, 15, 19, 21, 22, 23, 24, 25, 29, 30, 31, 33, 39, 40, 41, 49, 50],
            [ 3, 9, 11, 12, 21, 21, 21, 22, 22, 22, 22, 22, 22, 33, 33, 21, 21, 21,  3, 12])
            
  out_BR = out_BR.multiply(limitesRaster.eq(2)).selfMask()
  //dados AR
  var out_AR = ee.Image(coll_AR.select('classification_'+ano).mosaic())
  out_AR = out_AR.remap(
            [ 2, 3, 4, 9, 11, 12, 15, 18, 21, 22, 33],
            [ 2, 3, 4, 9, 11, 12, 21, 21, 21, 22, 33])
            
  out_AR = out_AR.multiply(limitesRaster.eq(1)).selfMask()
  // dados UY
  
//  var colList = ee.List([])
//  for (var i_reg=0;i_reg<regions_nameUY.length; i_reg++){
//    var regiao = regions_nameUY[i_reg];
//    var img = coll_UY.filterMetadata('region_name','equals',regiao).select('classification_'+ano).min()
//    img = img.mask(img.gt(0))
//    var colList = colList.add(img)
//  }
//  var mosaicUY = ee.ImageCollection(colList).mosaic()

  var out_UY = ee.Image(coll_UY.select('classification_'+ano).mosaic())
  var out_UY = out_UY.remap(
            [ 2, 3, 4, 9, 11, 12, 15, 18, 21, 22, 33],
            [ 3, 3, 3, 9, 11, 12, 21, 21, 21, 22, 33])
  
        //.filterMetadata('version','equals',version)
        //.filterBounds(myRegion.centroid())
  
  out_UY = out_UY.multiply(limitesRaster.eq(3)).selfMask()
  
  
  var img_out = ee.ImageCollection([out_AR,out_BR,out_UY]).mosaic()
  Map.addLayer(img_out,vis5, 'original' + String(ano))
  img_out = img_out.mask(img_out.gt(0))
  img_out = img_out.unmask(27)
  //img_out = img_out.multiply(img_out.gt(0))
  
  
  //img_out = img_out.eq(0).multiply(27)
  var filterParams = [
      {classValue: 27, maxSize: 30},
      //{classValue: 2, maxSize: 5}, // o tamanho maximo que o mapbiomas está usado é 5
      //{classValue: 3, maxSize: 5}, // este valor foi definido em reunião
      //{classValue: 4, maxSize: 3},
      ];
  var pc = new PostClassification(img_out);
  
  
  var filtered = pc.spatialFilter(filterParams);
  filtered = filtered.reproject('epsg:4326', null, 30)
 
  img_out = img_out.select(['remapped'],['classification_'+ano])
  print(img_out)

  //Map.addLayer(filtered,vis5,'filtered',false)
  img_out = img_out.set('biome', bioma)
  img_out = img_out.set('year', parseInt(ano,10))
  img_out = img_out.set('version', versaoout)
  img_out = img_out.set('collection', 2.0)
  img_out = img_out.set('source', source)
  
  Export.image.toDrive({
		'image': img_out.toByte(),
    'description': bioma+'-'+ano+'-'+versaoout,
    'folder': 'mapas_colecion_2',
    'region': geometryPampa,
    'scale': 30,
    'maxPixels': 1e13,
  	//'shardSize:':32,
	 'fileFormat':'GeoTIFF'
})

}



