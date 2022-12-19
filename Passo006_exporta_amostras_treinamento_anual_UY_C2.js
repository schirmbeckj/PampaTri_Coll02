var versao = 'v02'
var version_mosaic = '4'
var dirout = 'projects/MapBiomas_Pampa/SAMPLES/C2/URUGUAY/YEAR/';

var dirasset =  'projects/nexgenmap/MapBiomas2/LANDSAT/PAMPA/mosaics';
var dirasset7 = 'projects/nexgenmap/MapBiomas2/LANDSAT/PAMPA/mosaics-landsat-7';

var regions = ee.FeatureCollection('projects/MapBiomas_Pampa/ANCILLARY_DATA/RegionesUy_Buf')

var limite = regions.geometry()
var biome = 'PAMPAURUGUAY'
var pts = ee.FeatureCollection('projects/MapBiomas_Pampa/SAMPLES/C2/URUGUAY/samples_C2_PAMPAURUGUAY_v01')

Map.addLayer(pts, {}, 'pontos', false)
print('pontos',pts.first())
print(pts.size())
//var pts_reg = pts.filterMetadata('ID', 'equals', 1)
//print('pontos regiao',pts_reg)

var palettes = require('users/mapbiomas/modules:Palettes.js');

//nomes bandas
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
'ndvi_amp_3y', //calculada no script
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
'ndvi_a_3y', //calculada no script
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

var anos = [
            1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,
            //1995,1996,1997,1998,1999, 
            //2000,2001,2002,2003,2004,2005,2006,
            //2007,2008,2009,2010,2011,2012,2013,2014,
            //2015,2016,2017,2018,2019,2020,2021
            ];
//var anos = [2019,2020]
var terrain = ee.Image("JAXA/ALOS/AW3D30_V1_1").select("AVE");
var slope = ee.Terrain.slope(terrain)
var square = ee.Kernel.square({radius: 5});

var regions_name= ['cristalino','graben_LM','Sierras_Este', 'sedimentaria_gnw','basaltica','graben_SL','sedimentaria_Oeste'] 

var ll = ee.Image.pixelLonLat().clip(limite)
    
var long = ll.select('longitude').add(0).multiply(-1).multiply(1000).toInt16()
var lati = ll.select('latitude').add(0).multiply(-1).multiply(1000).toInt16()

var mosaicos1 = ee.ImageCollection(dirasset)
                  .filterMetadata('biome', 'equals', biome)
                  .filterMetadata('version', 'equals', version_mosaic)
print('mosaicos1',mosaicos1)
var mosaicos2 = ee.ImageCollection(dirasset7)
                  .filterMetadata('biome', 'equals', biome)
                  .filterMetadata('version', 'equals', version_mosaic)
var mosaicos = mosaicos1.merge(mosaicos2)

print('mosaicos',mosaicos)

for (var i_ano=0;i_ano<anos.length; i_ano++){
//for (var i_ano=0;i_ano<1; i_ano++){
  var ano = anos[i_ano];
  //print('ano',ano)
    var mosaicoTotal = mosaicos.filterMetadata('year', 'equals', (ano))
                        .mosaic()
    if (ano == 1985){//usa o valor do ano como apmlitude
      //var amp3anos = max3anos.subtract(min3anos).rename('amp_ndvi_3anos')
      var min3anos = mosaicoTotal.select('ndvi_median_dry')
      //print(min3anos)
      var max3anos = mosaicoTotal.select('ndvi_median_wet')
    }
    if (ano == 1986){//usa os 2 anos anteriores como amplitude
      //var amp3anos = max3anos.subtract(min3anos).rename('amp_ndvi_3anos')
      var mosaico1ano_antes = mosaicos
                      .filterMetadata('year', 'equals', ( ano - 1))
                      .filterBounds(limite)
                      .mosaic()
      var min3anos = ee.ImageCollection.fromImages([mosaicoTotal.select('ndvi_median_dry'),
                                                  mosaico1ano_antes.select('ndvi_median_dry')]).min()
      var max3anos = ee.ImageCollection.fromImages([mosaicoTotal.select('ndvi_median_wet'),
                                                  mosaico1ano_antes.select('ndvi_median_wet')]).max()
    }
    if (ano > 1987){
      var mosaico1ano_antes = mosaicos
                      .filterMetadata('year', 'equals', ( ano - 1))
                      .filterBounds(limite)
                      .mosaic()
      var mosaico2anos_antes = mosaicos
                      .filterMetadata('year', 'equals', ( ano - 2))
                      .filterBounds(limite)
                      .mosaic()
      var min3anos = ee.ImageCollection.fromImages([mosaicoTotal.select('ndvi_median_dry'),
                                                  mosaico1ano_antes.select('ndvi_median_dry'),
                                                  mosaico2anos_antes.select('ndvi_median_dry')]).min()
      var max3anos = ee.ImageCollection.fromImages([mosaicoTotal.select('ndvi_median_wet'),
                                                  mosaico1ano_antes.select('ndvi_median_wet'),
                                                  mosaico2anos_antes.select('ndvi_median_wet')]).max()
    
      
    }
    var amp3anos = max3anos.subtract(min3anos).rename('ndvi_amp_3y')
    var ndvi_color = '0f330f, 005000, 4B9300, 92df42, bff0bf, FFFFFF, eee4c7, ecb168, f90000'
    var visParNDFI_amp = {'min':0, 'max':60, 'palette':ndvi_color};
    //Map.addLayer(amp3anos, visParNDFI_amp, 'amp3anos', true);
    mosaicoTotal = mosaicoTotal.addBands(amp3anos)

    mosaicoTotal = mosaicoTotal.addBands(long.rename('longitude'))
    mosaicoTotal = mosaicoTotal.addBands(lati.rename('latitude' ))
    
    mosaicoTotal = mosaicoTotal.addBands(slope.int8().clip(limite),['slope'])
    
    //var entropyG = mosaicoTotal.select('green_median').entropy(square);
    //mosaicoTotal = mosaicoTotal.addBands(entropyG.select([0],['textG']).multiply(100).int16())
     print('mosaico longo',mosaicoTotal,ano)
    mosaicoTotal = mosaicoTotal.select(bandNames,bandNamesShort)
    //var  mosSHP = mosaicoTotal.rename(bnamesSHP)
    print('mosaico curto',mosaicoTotal,ano)
    Map.addLayer(mosaicoTotal, {}, 'mosaico', false)

  for (var i_reg=0; i_reg<regions_name.length; i_reg++){
  //var region = 6
    var region = regions_name[i_reg];
    //print(region)
    //var limite = regions.filterMetadata('ECOZONA', 'equals', region)
    //print(limite)
    //Map.addLayer(limite, {}, 'limite region', false)
    
    var pts_reg = pts.filterMetadata('ECOZONA', 'equals', region)
    //print('n pontos',pts_reg.size())
    
    var training = mosaicoTotal.sampleRegions({
        'collection': pts_reg,
        'scale': 30,
        'tileScale': 4,
        'geometries': true
    });
    print(training.first())
//      var trainingSHP = mosSHP.sampleRegions({
//          'collection': pts_reg,
//          'scale': 30,
//          'tileScale': 4,
//          'geometries': true
//      });

      
    if (i_reg == 0){ 
      var training_reg = training 
      Map.addLayer(training_reg, {}, 'primeira', false)
      //var training_regSHP = trainingSHP 
    }  
    else {
      training_reg = training_reg.merge(training);
      //print(training_reg.first())
      //training_regSHP = training_regSHP.merge(trainingSHP);
    }
    

    //print('region ' + String(region) + 'tamanho = ' +  String(training.size()))
    
  }    
  
//print('training', training_reg)
//print('training limite',training_reg.limit(1))
//print('training zise',training_reg.size())

//Map.addLayer(training_reg, {}, 'resultado final', false)
//print(training_reg.first())
//Export.table.toAsset(training_reg, 
//                      'pontos_exp1_C2_' + versao + '_' + ano , 
//                      dirout + 'pontos_exp1_C2_' + versao + '_' + ano);

Export.table.toDrive({
    collection: training_reg,
    fileFormat: 'SHP', // 'CSV',//KML,
    folder:'amostras_coll2_shp',
    description: 'pontos_exp1_UY_' + versao + '_' + ano + '_shp'
    })

  
}
