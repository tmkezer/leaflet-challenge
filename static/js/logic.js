// Define USGS URL
var usgsURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Create function to determine color
function circleColor(magnitude) {
    switch (true) {
        case (magnitude < 1):
          return "rgb(153, 255, 51)";
        case (magnitude < 2):
          return "rgb(255, 255, 0)";
        case (magnitude < 3):
          return "rgb(255, 204, 0)";
        case (magnitude < 4):
          return "rgb(255, 153, 51)";
        case (magnitude < 5):
          return "rgb(255, 102, 0)";
        default:
          return "rgb(255, 71, 26)";
        }
}

// Create a function to pass the details to the popup
function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "</h3>" +
        "<hr>" +
        "<h3>" + feature.properties.mag + "</h3>" +
        "<hr>" +
        "<p>" + new Date(feature.properties.time) + "</p>");
}

// Pass the URL to a GET request
d3.json(usgsURL, function (data) {
    CreateMarkers(data.features);
    // console.log(data.features)
});

function CreateMarkers(usgsData) {

    // Read the USGS GEO JSON data
    var earthquakes = L.geoJSON(usgsData, {
        pointToLayer: function (usgsData, latlng) {
            return L.circle(latlng, {
                radius: (usgsData.properties.mag * 15000),
                color: circleColor(usgsData.properties.mag),
                fillOpacity: 1
            });
        },
        onEachFeature: onEachFeature
    });

    // Add the earthquakes layer to our map
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Create the different Map views
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "streets-v11",
        accessToken: API_KEY
    });

    // Create the faultline layer
    var faultLine = new L.LayerGroup();

    // Define an object for our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Light Map": lightmap,
        "Satellite Map": satellitemap

    };

    // Define an object for our overlay layers
    var overlayMaps = {
        Earthquakes: earthquakes,
        FaultLines: faultLine
    };

    // Create our map, define which layers to initialize with
    var myMap = L.map("map", {
        center: [
            0, 0
        ],
        zoom: 2,
        layers: [streetmap, earthquakes, faultLine]
    });

    // Create a layer control and add our layer objects
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(myMap);

    // Define faultline URL
    var faultlineURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

    // Read the faultline GEO JSON data and add to layer
    d3.json(faultlineURL, function (data) {
        L.geoJSON(data, {
            interactive: false,
            style: function () {
                return { color: "grey", fillOpacity: 0 }
            }
        }).addTo(faultLine)
    })

    // Add legend to the map
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend'),
            mags = [0, 1, 2, 3, 4, 5]

        // Loop through mags to define legend color
        for (var i = 0; i < mags.length; i++) {
            div.innerHTML +=
                '<i style="background:' + circleColor(mags[i]) + '"></i> ' +
                mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
}


