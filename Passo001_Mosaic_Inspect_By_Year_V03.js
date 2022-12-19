/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var gridsPampa = ee.FeatureCollection("users/evelezmartin/shp/ibge_250000_Pampa2020_llw84");
/***** End of imports. If edited, may not auto-convert in the playground. *****/



//
var assetMosaics = 'projects/nexgenmap/MapBiomas2/LANDSAT/PAMPA/mosaics';
var assetMosaicsL7 = 'projects/nexgenmap/MapBiomas2/LANDSAT/PAMPA/mosaics-landsat-7';
var assetMosaicsOld = 'projects/MapBiomas_Pampa/MOSAICS/mosaics_c1';

var assetScenes = 'projects/mapbiomas-workspace/AUXILIAR/landsat-mask';
var assetGrids = 'projects/MapBiomas_Pampa/ANCILLARY_DATA/CartasPampaTrinacional_col2';
//var assetBiomes = 'projects/mapbiomas-workspace/AUXILIAR/biomas-raster-41';

var year = 2013;
//var biomeName = 'PAMPAARGENTINA';
var biomeName = 'PAMPAURUGUAY';

var collectionMosaics = ee.ImageCollection(assetMosaics);
var collectionMosaicsL7 = ee.ImageCollection(assetMosaicsL7);
var collectionMosaicsOld = ee.ImageCollection(assetMosaicsOld);

collectionMosaics = collectionMosaics.merge(assetMosaicsL7)

var version = '4'

var collectionScenes = ee.ImageCollection(assetScenes)
    .filterMetadata('version', 'equals', version);

var collectionGrids = ee.FeatureCollection(assetGrids);

//var biomes = ee.Image(assetBiomes);

var biomeCollection = collectionMosaics
    .filterMetadata('biome', 'equals', biomeName)
    .filterMetadata('version', 'equals', version);

print(
    'Mosaicos novos por ano:',
    biomeCollection.aggregate_histogram('year')
);

biomeCollection = biomeCollection
    .filterMetadata('year', 'equals', year)
    //.filterMetadata('grid_name', 'equals', 'SH-21-Y-B');
print(biomeCollection)
/*
var biomeCollectionL7 = collectionMosaicsL7
    .filterMetadata('year', 'equals', year)
    .filterMetadata('biome', 'equals', biomeName)
    .filterMetadata('version', 'equals', version);
*/
if (biomeName == 'PAMPAARGENTINA'){
  var biomeName_c1 = 'PampaArgentina'
}
if (biomeName == 'PAMPAURUGUAY'){
  var biomeName_c1 = 'PampaUruguay'
}
var biomeCollectionOld = collectionMosaicsOld
    .filterMetadata('year', 'equals', year)
    .filterMetadata('biome', 'equals', biomeName_c1);



Map.addLayer(biomeCollectionOld,
    {
        bands: ['median_swir1', 'median_nir', 'median_red'],
        gain: [0.08, 0.06, 0.2],
        gamma: 0.85
    },
    biomeName + ' OLD ' + String(year)
);

/*
Map.addLayer(biomeCollectionL7,
    {
        bands: ['swir1_median', 'nir_median', 'red_median'],
        gain: [0.08, 0.06, 0.2],
        gamma: 0.85
    },
    biomeName + ' L7 ' + String(year)
);
*/

Map.addLayer(biomeCollection,
    {
        bands: ['swir1_median', 'nir_median', 'red_median'],
        gain: [0.08, 0.06, 0.2],
        gamma: 0.85
    },
    biomeName + ' ' + String(year)
);
/*
Map.addLayer(biomes,
    {
        min: 1,
        max: 6,
        palette: '#0df2c9,#4EC5F1,#20272F',
        format: 'png'
    },
    'Biomes',
    false,
    0.7
);
*/
Map.addLayer(collectionScenes.sum(),
    {
        min: 0,
        max: 4,
        palette: 'ffcccc,ff0000'
    },
    'Landsat tiles',
    false,
    0.3
);

Map.addLayer(collectionGrids,
    {
        color: '0000ff',
    },
    'Grids tiles',
    false,
    0.3
);


Map.setCenter(-59.093, -33.094, 5);


// SB: Revision Mosaicos
var Window = {
  grid_name: ui.Label(),
  year:  ui.Label(),
  panel: ui.Panel([],ui.Panel.Layout.Flow("vertical"), {width: "200px", position: "bottom-right"}),
  
  init: function(){
    Window.panel.add(Window.grid_name)
    Window.panel.add(Window.year)

    Map.add(Window.panel);    
  }
}


Window.init();

var show_panel_info = function(p){
  var point = ee.Geometry.Point([p.lon,p.lat])
  var grid_name = collectionGrids.filterBounds(point).first().get("grid_name")
  
  Window.grid_name.setValue("Grid Name: " + grid_name.getInfo())
  Window.year.setValue("Year: " + year)
    
}

Map.onClick(show_panel_info)