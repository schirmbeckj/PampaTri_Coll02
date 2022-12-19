/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var regioes = ee.FeatureCollection("users/evelezmartin/shp/Regioes_Pampa_coll05");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/**
 * @description
 *    calculate area
 * 
 * @author
 *    João Siqueira
 *  
 */



var version = '6'
var asset = 'projects/MapBiomas_Pampa/COLLECTION2/classification'
// LULC mapbiomas image
var mapbiomas = ee.ImageCollection(asset).filter(ee.Filter.eq('version',version)).toBands().selfMask();
print(mapbiomas)



var limites = ee.FeatureCollection('users/evelezmartin/shp/Pampa_Tri_paises_mosaico_c2')
var ar = limites.filterMetadata('country','equals','Argentina')
ar = ar.first().set('ID',1)
var br = limites.filterMetadata('country','equals','Brasil')
br = br.first().set('ID',2)
var uy = limites.filterMetadata('country','equals','Uruguay')
uy = uy.first().set('ID',3)
var assetTerritories = ee.FeatureCollection([ar,uy,br])

var geometry = limites.geometry().bounds()

print(assetTerritories)
//var assetTerritories = regioes;

// Change the scale if you need.
var scale = 30;

// Define a list of years to export
var years = [
    '1985', '1986', '1987', '1988', '1989', '1990', '1991', '1992',
    '1993', '1994', '1995', '1996', '1997', '1998', '1999', '2000',
    '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008',
    '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016',
    '2017', '2018', '2019', '2020',
    '2021'
];

// Define a Google Drive output folder 
var driverFolder = 'AREA-EXPORT';

/**
 * Imports the legend codes
 */
var legends = require('users/mapbiomas/modules:Legend.js');

var legend = ee.Dictionary(legends.get('brazil'));

/**
 * 
 */
// Territory image
var territory = ee.Image().int16().paint({
    featureCollection: ee.FeatureCollection(assetTerritories),
    color: 'ID'
}).rename(['territory']);



// Image area in km2
var pixelArea = ee.Image.pixelArea().divide(1000000);

// Geometry to export
//var geometry = mapbiomas.geometry();

/**
 * Convert a complex ob to feature collection
 * @param obj 
 */
var convert2table = function (obj) {

    obj = ee.Dictionary(obj);

    var territory = obj.get('territory');

    var classesAndAreas = ee.List(obj.get('groups'));

    var tableRows = classesAndAreas.map(
        function (classAndArea) {
            classAndArea = ee.Dictionary(classAndArea);

            var classId = classAndArea.get('class');
            var area = classAndArea.get('sum');

            var tableColumns = ee.Feature(null)
                .set('territory', territory)
                .set('class_id', classId)
  //              .set('class_name', ee.Dictionary(legend.get(classId)).get('pt-br'))
                .set('area', area);

            return tableColumns;
        }
    );

    return ee.FeatureCollection(ee.List(tableRows));
};

/**
 * Calculate area crossing a cover map (deforestation, mapbiomas)
 * and a region map (states, biomes, municipalites)
 * @param image 
 * @param territory 
 * @param geometry
 */
var calculateArea = function (image, territory, geometry) {

    var reducer = ee.Reducer.sum().group(1, 'class').group(1, 'territory');

    var territotiesData = pixelArea.addBands(territory).addBands(image)
        .reduceRegion({
            reducer: reducer,
            geometry: geometry,
            scale: scale,
            maxPixels: 1e12
        });

    territotiesData = ee.List(territotiesData.get('groups'));

    var areas = territotiesData.map(convert2table);

    areas = ee.FeatureCollection(areas).flatten();

    return areas;
};

var areas = years.map(
    function (year) {
      
        
        var image = mapbiomas.select(['PAMPATRI-' + year + '-6_classification_' + year],['classification_' + year]);

        var areas = calculateArea(image, territory, geometry);

        // set additional properties
        areas = areas.map(
            function (feature) {
                return feature.set('year', year);
            }
        );

        return areas;
    }
);

areas = ee.FeatureCollection(areas).flatten();
//print(areas)

Export.table.toDrive({
    collection: areas,
    description: 'mapbiomas-areas-cover',
    folder: driverFolder,
    fileNamePrefix: 'PampaTri-mapbiomas-areas-cover-v'+ version,
    fileFormat: 'CSV'
});

Map.addLayer(territory.randomVisualizer());
