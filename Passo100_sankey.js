/**
 * @description
 *    calculate agreemnet areas
 * 
 * @author
 *    João Siqueira
 * 
 */ 
 
// Assets
var version = '033_final_com'//'033_sem' //
var assetId1 = ee.Image('projects/mapbiomas-workspace/AMOSTRAS/col6/PAMPA/class_col6_mosaic/PAMPA_03')
              .select('classification_1990','classification_2000','classification_2010','classification_2020');
print(assetId1)

var assetId2 = ee.Image('projects/mapbiomas-workspace/AMOSTRAS/col7/PAMPA/class_col7_mosaic/PAMPA_' + version + '_filtro')
              .select('classification_1990','classification_2000','classification_2010','classification_2020');

print(assetId2)

//var assetId2 = "projects/mapbiomas-workspace/AMOSTRAS/col6/PAMPA/class_col6_mosaic/PAMPA_coll05_11_final";


// Asset of regions for which you want to calculate statistics
var assetTerritories = "projects/mapbiomas-workspace/AUXILIAR/biomas-2019-raster";

// Territory id
var territoryId = 6;

// Output file name
var outFileName = 'agreement_' + version;

// Dolumn names to identify maps
var preffix1 = 'col6_pre';
var preffix2 = 'col7_v2_pre';

// Define a list of years to export
var years = [
    //1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992,
    //1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
    //2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008,
    //2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
    //2017, 2018, 2019
    1990,2000,2010,2020
];

// Change the scale if you need.
var scale = 30;

// Define a Google Drive output folder 
var driverFolder = 'AREA-EXPORT';

/**
 * 
 * @param asset
 * @returns
 */
var getAssetData = function (asset) {

    var loadAsset = {
        'Image': function (asset) {
            return ee.Image(asset.id);
        },
        'ImageCollection': function (asset) {
            return ee.ImageCollection(asset.id).mosaic();
        }
    };

    return loadAsset[asset.type](asset);
};

/**
 * Convert a complex ob to feature collection
 * @param obj 
 */
var convert2table = function (obj) {

    obj = ee.Dictionary(obj);

    var classId2 = obj.get(preffix2);

    var classesAndAreas = ee.List(obj.get('groups'));

    var tableRows = classesAndAreas.map(
        function (classAndArea) {
            classAndArea = ee.Dictionary(classAndArea);

            var classId1 = classAndArea.get(preffix1);
            var area = classAndArea.get('sum');

            var tableColumns = ee.Feature(null)
                .set(preffix2, classId2)
                .set(preffix1, classId1)
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
var calculateArea = function (image1, image2, geometry) {

    var reducer = ee.Reducer.sum().group(1, preffix1).group(1, preffix2);

    var territotiesData = pixelArea.addBands(image2).addBands(image1)
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

/**
 * 
 */
// Territory image
var territory = ee.Image(assetTerritories).eq(territoryId);

// LULC images
var image1 = assetId1//getAssetData(ee.data.getAsset(assetId1));
var image2 = assetId2//getAssetData(ee.data.getAsset(assetId2));

// Image area in km2
var pixelArea = ee.Image.pixelArea().divide(1000000);

// Geometry to export
var geometry = territory.geometry();

var areas = years.map(
    function (year) {
        var image1Year = image1.select('classification_' + String(year));
        var image2Year = image2.select('classification_' + String(year));

        // use territory to mask the data
        image1Year = image1Year.mask(territory);
        image2Year = image2Year.mask(territory);

        // use value -1 to identify the non-overlaping area
        image1Year = image1Year.unmask(-1);
        image2Year = image2Year.unmask(-1);

        // calculate area
        var areas = calculateArea(image1Year, image2Year, geometry);

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

Export.table.toDrive({
    collection: areas,
    description: 'agreement',
    folder: driverFolder,
    fileNamePrefix: outFileName,
    fileFormat: 'CSV'
});
