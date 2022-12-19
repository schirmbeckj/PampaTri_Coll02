//script do Dhemerson com output melhorado, ajustado por E Velez para rodar no Pampa
 
// define root folder for the classification data

var version = '034_final_com'//'033_sem'

var file_path = 'projects/mapbiomas-workspace/AMOSTRAS/col7/PAMPA/class_col7_mosaic/';
var file_name = 'PAMPA_'+ version +'_filtro';

var m_from = [3, 4, 5, 49, 9, 11, 12, 15, 19, 20, 21, 40, 41, 36, 46, 47, 48, 22, 23, 24, 30, 39, 25, 29, 26, 33, 31];
var m_to   = [3, 3, 3, 3,  9, 11, 12, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 21, 22, 29, 33, 33, 33];

// import classification data - each band needs to correspond to one year 
var classification = ee.Image(file_path + file_name);

// import validation points 
var assetPoints = ee.FeatureCollection('projects/mapbiomas-workspace/VALIDACAO/MAPBIOMAS_100K_POINTS_utf8');
print(assetPoints.limit(10))

// classification regions
var regionsCollection = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/PAMPA/Pampa_regions_col5_area2000');
var regionsCollection = regionsCollection.map(function(f){
        return f.select(['ID'])})
print(regionsCollection)

var biomeCode2019 = 'Pampa';
var biomas = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/biomas_IBGE_250mil')
   .filterMetadata('Bioma', 'equals', biomeCode2019);
   
// define years to be assessed 
var years = [ 
            1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
            1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012,
            2013, 2014, 2015, 2016, 2017, 2018
           ];
            
// exclude this classes from validation points (for col6)

var excludedClasses = [
    "Não Observado",
    "Erro",
    "-",
    "Não consolidado",
    "Não consolidado",
//   "Silvicultura",
//   "silvicultura",
//    "Floresta Plantada",
//    "Cultura Perene",
//    "Cultura Anual",
//    "Cultura Semi-Perene",
    "Mangue",
//    "Mineração",
    "Outra Formação não Florestal",
    "Apicum",
 //   "Praia e Duna",
//    "�rea �mida Natural n�o Florestal",
//    "Área Úmida Natural não Florestal",
//    "�rea �mida Natural N�o Florestal",
//    "Área Úmida Natural Não Florestal",
    "Outra Forma��o Natural N�o Florestal",
    "Outra Formação Natural Não Florestal",
 //   "Outra �rea N�o Vegetada",
 //   "Outra Área Não Vegetada",
    "Rengeração",
    "Desmatamento"
]; 

// define pixel value that corresponds to each LAPIG class for col 6
// para cada classe LAPIG (referencia) criar correspondencia mapbiomas (piuxel value)
var classes = ee.Dictionary({
  "Cultura Anual": 21,
  "Cultura Perene": 21,
  "Cultura Semi-Perene": 21,
  "Infraestrutura Urbana": 22,
  "Mineração": 22,
  "Pastagem Cultivada": 21,
  "Silvicultura": 3,
  "silvicultura": 3,
  "Floresta Plantada": 3,
  "Formação Florestal": 3,
  "Rio, Lago e Oceano": 33,
  "Outra Área não Vegetada": 22,
  //"Outra Formação não Florestal": 13,
  "Formação Campestre": 12,
  "Afloramento Rochoso": 29,
//  "Formação Savânica": 4,
  "Pastagem Natural": 12,
  //"Apicum": 13,
  "Aquicultura": 33,
  "Praia e Duna": 22,
//  "Regeneração": 3,
//  "Desmatamento": 21,
  "�rea �mida Natural n�o Florestal": 11,
  "Área Úmida Natural não Florestal": 11,
  "�rea �mida Natural N�o Florestal": 11,
  "Área Úmida Natural Não Florestal": 11,
//  "Outra Forma��o Natural N�o Florestal": 13,
//  "Outra Formação Natural Não Florestal": 13,
  "Outra �rea N�o Vegetada": 22,
  "Outra Área Não Vegetada": 22
}); 

// create empty recipe to receive data
var recipe = ee.FeatureCollection([]);

// for each year:
years.forEach(function(year_i){
  // import image classification for the year [i]
  var classification_i = classification.select('classification_' + year_i);
  // use only vlaid pixels, that is, not equal to zero
  classification_i = classification_i.updateMask(classification_i.neq(0));
  //Map.addLayer(classification_i, {}, 'year ' + year_i);
  classification_i = classification_i.remap(m_from, m_to).rename('classification_' + year_i);
  
  var valPoints_i = ee.FeatureCollection(assetPoints)
      .filterMetadata('POINTEDITE', 'not_equals', 'true')
//      .filterMetadata('BIOMA', 'equals', bioma)
      .filterBounds(biomas)
      .filter(ee.Filter.inList('CLASS_' + year_i, excludedClasses).not())
      
    .map(function (feature) {
            return feature.set('year', year_i).set('reference', classes.get(feature.get('CLASS_' + year_i)));
        }
    );
                    
                   
  // for each region:
  var computeAccuracy = regionsCollection.map(function(feature) {
    // clip classification for the year [i]
    var classification_ij = classification_i.clip(feature);
    
    // filter validation points to the year [i] 
    var valPoints_ij = valPoints_i.filterBounds(feature.geometry());
    
    // extract classification value for each point and pair it with the reference data
    var paired_data = classification_ij.sampleRegions({
                      collection: valPoints_ij, 
                      properties: ['reference'], 
                      scale: 30, // 30 for collection 6
                      geometries: false});
    
    // compute confusion matrix
    var confusionMatrix= paired_data.errorMatrix('classification_' + year_i, 'reference');
    
    // compute accuracy metrics
    var global_accuracy = confusionMatrix.accuracy();
    var user_accuracy = confusionMatrix.consumersAccuracy();
    var producer_accuracy = confusionMatrix.producersAccuracy();
    
    // insert accuracy metrics as metadata for each vector
    return feature.set('GLOB_ACC', global_accuracy)
                  .set('VERSION', file_name)
                  .set('YEAR', year_i)
                  .set('SIZE', valPoints_ij.size());
    });
  
  // update recipe with yearly data
  recipe = recipe.merge(computeAccuracy);
  
  // set geometries to null
  recipe = recipe.map(function (feature) {
    return feature.setGeometry(null);
   }
  );
 
});

//print(recipe);

//print(recipe.limit(10));

// export result as CSV
Export.table.toDrive({
  collection: recipe,
  description: 'accuracy_' + file_name,
  folder: 'AREA-EXPORT',
  fileFormat: 'CSV'
});