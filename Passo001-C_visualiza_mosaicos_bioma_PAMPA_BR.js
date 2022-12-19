//var biome = 'PampaBrasil'
var biome = 'PAMPAARGENTINA'
//var biome = 'PAMPAURUGUAY'
var biome = 'PAMPA'
var version = '1' //1 - simplificada, 2 full com mediana
//======================================================================
 
var years = [
             1985,1986,1987,1988,1989, 
             1990,1991,1992,1993,1994,
             1995,1996,1997,1998,1999,
             2000,2001,2002,2003,2004,
             2005,2006,2007,2008,2009,
             2010,2011,2012,2013,2014,
             2015,2016,2017,2018,2019,
             2020,2021];


var dirasset =  'projects/nexgenmap/MapBiomas2/LANDSAT/BRAZIL/mosaics-2-pampa';

var mosaicos1 = ee.ImageCollection(dirasset)
                  .filterMetadata('biome', 'equals', biome)
                  .filterMetadata('version', 'equals', version)
//var mosaicos2 = ee.ImageCollection(dirasset7)
//                  .filterMetadata('biome', 'equals', biome)
//                  .filterMetadata('version', 'equals', version)
var collection = mosaicos1//.merge(mosaicos2)
   

//var collection = ee.ImageCollection('projects/MapBiomas_Pampa/MOSAICS/mosaics_c1')
//                  .filterMetadata('biome', 'equals', biome);
                  
if (biome == 'PampaBrasil'){
  var collection = ee.ImageCollection("projects/mapbiomas-workspace/MOSAICOS/workspace-c3")
                    .filterMetadata('biome', 'equals', 'PAMPA');
  print(collection)
}


var biomefc = ee.FeatureCollection('projects/MapBiomas_Pampa/ANCILLARY_DATA/pampa-trinacional')
    .filterMetadata('Bioma', 'equals', 'PampaBrasil');

//print(biomefc)

var vis = {'bands':['swir1_median','nir_median','red_median'], 'gain':[0.08, 0.06,0.2],'gamma':0.5 };

var maps = [],
    map,
    mosaic,
    subcollection,
    size,
    total = 0;

for (var i = 0; i < years.length; i++) {

    subcollection = collection.filterMetadata('year', 'equals', years[i]);

    mosaic = subcollection.mosaic();

    map = ui.Map();
    
    map.setControlVisibility({'all':false});

    size = subcollection.size().getInfo();
    total = total + size;

    map.add(ui.Label('Total: ' + size, {
        'position': 'bottom-right',
        'fontWeight': 'bold'
    }));

    map.add(ui.Label(String(years[i]), {
        'position': 'bottom-left',
        'fontWeight': 'bold'
    }));

    map.addLayer(mosaic/*.clip(biomefc)*/, vis, String(years[i]));

    maps.push(map);
}

var label = ui.Label('Total: ' + total, {
    'padding': '60px',
    'fontWeight': 'bold',
    'fontSize': '50px'
});

maps.push(ui.Map().setControlVisibility({'all':false}));
maps.push(ui.Map().setControlVisibility({'all':false}));
maps.push(ui.Map().setControlVisibility({'all':false}));
maps.push(ui.Map().setControlVisibility({'all':false}));

var linker = ui.Map.Linker(maps);

// Create a title.
var title = ui.Label('ImgTools Visualizer | Mosaics of Collection 3.0', {
    stretch: 'horizontal',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '24px',

});

var legend = ui.Label("Legend", {
    'fontWeight': 'bold',
    'fontSize': '50px'
});
// Create a grid of maps.
var mapGrid = ui.Panel([
    ui.Panel([maps[0], maps[1], maps[2], maps[3], maps[4]],
            ui.Panel.Layout.Flow('horizontal'), {
                // stretch: 'both'
            }),
    ui.Panel([maps[5], maps[6], maps[7], maps[8], maps[9]],
            ui.Panel.Layout.Flow('horizontal'), {
                // stretch: 'both'
            }),
    ui.Panel([maps[10], maps[11], maps[12], maps[13], maps[14]],
            ui.Panel.Layout.Flow('horizontal'), {
                // stretch: 'both'
            }),
    ui.Panel([maps[15], maps[16], maps[17], maps[18], maps[19]],
            ui.Panel.Layout.Flow('horizontal'), {
                // stretch: 'both'
            }),
    ui.Panel([maps[20], maps[21], maps[22], maps[23], maps[24]],
        ui.Panel.Layout.Flow('horizontal'), {
            // stretch: 'both'
        }),
    ui.Panel([maps[25], maps[26], maps[27], maps[28], maps[29]],
        ui.Panel.Layout.Flow('horizontal'), {
            // stretch: 'both'
        }),
    ui.Panel([maps[30], maps[31], maps[32], maps[33], maps[34]],
        ui.Panel.Layout.Flow('horizontal'), {
            // stretch: 'both'
        }),
    ui.Panel([maps[35], maps[36], maps[37], maps[38], maps[39]],
        ui.Panel.Layout.Flow('horizontal'), {
            // stretch: 'both'
        })
        
  ],
    ui.Panel.Layout.Flow('vertical'), {
        stretch: 'both'
    }
);

// Add the maps and title to the ui.root.
ui.root.widgets().reset([mapGrid]);
ui.root.setLayout(ui.Panel.Layout.Flow('vertical'));

maps[0].centerObject(biomefc,5);
//if (biome == 'PampaArgentina'){
//  maps[0].centerObject(biomefc,4);
//}
