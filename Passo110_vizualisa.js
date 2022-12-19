var version = '4'
var asset = 'projects/MapBiomas_Pampa/COLLECTION2/classification'
// LULC mapbiomas image
var mapbiomas = ee.ImageCollection(asset).filter(ee.Filter.eq('version',version))
    .map(function (image) {
        var year = ee.String(image.get('year')).slice(0, 4);
        return image.set('year', year);
    })
print(mapbiomas)


var limites = ee.FeatureCollection('users/evelezmartin/shp/Pampa_Tri_paises_mosaico_c2')
var ar = limites.filterMetadata('country','equals','Argentina')
ar = ar.first().set('ID',1)
var br = limites.filterMetadata('country','equals','Brasil')
br = br.first().set('ID',2)
var uy = limites.filterMetadata('country','equals','Uruguay')
uy = uy.first().set('ID',3)
var limites = ee.FeatureCollection([ar,uy,br])


// ############### PARÂMETROS DE VISUALIZAÇÃO ###############################

var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis = {'min': 0, 'max': 62,  'palette': palettes.get('classification7')};

// ############### FUNÇÃO DO TIMELAPSE ###############################

var timeLapse = function (col) {

    var featCollection = col
        .distinct(['year'])
        .sort('year')
        .map(
            function (image) {
                return ee.Feature(null, {
                    'year': image.get('year'),
                    'y': 0,
                });
            }
        );

    var clickAction = function (year) {

        var image = col.filterMetadata('year', 'equals', year);
        print(image)
        image = ee.Image(image.first())
        image = image.mask(image.neq(27))
        var name = year;
      
        print(name)
        print(image)

        var layer = ui.Map.Layer({
            'eeObject': image,
            'visParams': vis,
            'name': 'Class ' + name ,
            'shown': true,
            'opacity': 1.0
        });
       
        
     Map.remove(Map.layers().get(0));
     

     Map.layers().insert(0, layer);
     
    };

    var chartOptions = {
        legend: 'none',
        lineWidth: 1,
        pointSize: 5,
        vAxis: {
            gridlines: {
                count: 0
            },
            viewWindow: {
                max: 100,
                min: 0
            }
        },
        chartArea: {
            left: 30,
            top: 2,
            bottom: 100,
            right: 30,
            width: '100%',
            height: '100%'
        },
        hAxis: {
            showTextEvery: 1,
            slantedTextAngle: 90,
            slantedText: true,
            textStyle: {
                color: '#000000',
                fontSize: 12,
                fontName: 'Arial',
                bold: false,
                italic: false
            }
        },
        tooltip: {
            isHtml: true,
            textStyle: {
                fontSize: 10,
            }
        },
        crosshair: {
            trigger: 'both',
            orientation: 'vertical',
            focused: {
                color: '#0000ff'
            },
            selected: {}
        },
        annotations: {
            style: 'line'
        },
        series: {
            0: {
                type: 'line',
                color: '#000000',
                pointsVisible: true
            },
            1: {
                color: '#ff0000',
                lineWidth: 0.1,
                pointsVisible: false
            },
            2: {
                color: '#ff0000',


            },
            3: {
                color: '#ff0000',
                lineWidth: 0.1,
                pointsVisible: false
            }

        }
    };

    var chartStyle = {
        position: 'bottom-center',
        border: '1px solid grey',
        width: '100%',
        height: '140px',
        margin: '0px',
        padding: '0px',
    };
    print(featCollection)
    var chartLapse = ui.Chart.feature.byFeature(featCollection, 'year', ['y', 'y'])
        .setChartType('ColumnChart')
        .setOptions(chartOptions);

    chartLapse.style().set(chartStyle);
    chartLapse.onClick(clickAction);

    panelTimelapse.clear();
    panelTimelapse.add(chartLapse);
    var listenerId;

};

// ############### FUNÇÃO PARA ORGANIZAR OS ITENS AO PAINEL #################

var Map = ui.Map();
var panelTimelapse = ui.Panel({
    'layout': ui.Panel.Layout.flow('horizontal'),
    'style': {
        'stretch': 'horizontal',
        'backgroundColor': '#ffffff',
    },
});

ui.root.setLayout(ui.Panel.Layout.flow('horizontal', false));

var widgetGrid = ui.Panel(
    [
        ui.Panel([Map],
            ui.Panel.Layout.Flow('horizontal'), {
                stretch: 'both'
            }),
        panelTimelapse
    ],
    ui.Panel.Layout.Flow('vertical'), {
        stretch: 'both'
    }
);
ui.root.widgets().reset([widgetGrid]);

// ############### ADICIONAR OS LAYERS AO MAPA ###############################

timeLapse(mapbiomas);

Map.addLayer(ee.Image().select(), {}, 'default layer', false);


// ############### CENTRALIZA NA REGIÃO DE INTERESSE ###############################

Map.centerObject(limites, 5);
