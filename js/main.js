var globalMap, globalOutput, myJson;
var attrArray = ['STUSPS','NAME','tot1950','tot1960','tot1970','tot1980','tot1990','tot2000','tot2010','Grand_Tota'];
var expressed = attrArray[0];

// Credits for map located on bottom right of map
var mbAttr = 'Map created by: Moe R, Stephanie B, and Dwight F';

var mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGZpZWxkMjMiLCJhIjoiY2p4NThuaGYxMDB3bDQ4cXd0eWJiOGJoeSJ9.T94xCeDwJ268CmzfMPXdmw';

// Basemap options located on top right of map
var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
dark  = L.tileLayer(mbUrl, {id: 'mapbox.dark',   attribution: mbAttr}),
outdoors = L.tileLayer(mbUrl, {id: 'mapbox.outdoors',   attribution: mbAttr});

//createMap builds map, returns variable globalMap
function createMap(){
	//create map
    const map = L.map('map', {
            center: [32.38, -84.00],
            zoom: 5.4,
            minZoom: 4,
            layers:grayscale
        });
            var baseLayers = {
            "Grayscale": grayscale,
            "Topographic": outdoors,
            "Darkscale": dark,
        };

            //call getData
            getData(map);

            L.control.layers(baseLayers).addTo(map);
    }
//getData loads geoJSON
function getData(map){
  $.getJSON('data/REGION4.geojson', function(data){

    //style color and outline properties
    geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

    //default layer style
    function style(feature) {
        return {
            weight: 0.7,
            opacity: 0.7,
            color: 'white',
            fillOpacity: 0.7,
            fillColor: getColor(feature.properties.Grand_Tota)
        };
    };

    //choropleth color map based on total disasters 1950-2019
    function getColor(b){
        return b >=0 & b <=49 ? '#ffffcc':
               b >=50 & b <=74 ? '#c7e9b4':
               b >=75 & b <=99 ? '#7fcdbb':
               b >=100 & b <=120 ? '#41b6c4':
               '#ffffff';
    };
    //iterate through each feature in the geoJSON
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });
    };

    //set the highlight on the map
    function highlightFeature(e) {

        var layer = e.target;
        layer.setStyle({fillOpacity: 1.0});

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        };

        info.update(layer.feature.properties);
    };

    function resetHighlight(e) {
        geojson.setStyle(style);
        info.update();
    };

    //build chart for the map
    var newChart = function(label, totData50, totData60, totData70, totData80, totData90, totData00, totData10) {
    var dataLength = label ? label.length : 0;
    var backgroundColors = ['#3981ad',
                            ];
    var colors = [];
    for (var i = 0; i < dataLength; i++) {
        colors.push(backgroundColors[i]);
    };
    var ctx = document.getElementById("myChart");
    var dataChart = [totData50,totData60,totData70,totData80,totData90,totData00,totData10];
    var myChart = new Chart(ctx,{
            type: 'bar',
            options: {
        layout: {
            padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 50
            }
        }
    },
            data: {
                datasets: [{
                    label: '',
                    fontColor: 'black',
                    data: dataChart,
                    backgroundColor: backgroundColors[0],
                    borderColor: "#999",
                    borderWidth: 1
                },
              ],

            labels:label},
            options: {
                fontColor: 'black',
                responsive:true,
                tooltips:{enabled:true},
                legend:{display:false},
                title:{display:true,position:'top',text:["Total Disasters by Decade"],fontFamily: "Helvetica",fontSize: 16,fontColor: 'black'},
                scales: {
                  xAxes: [{
                    ticks: {
                      fontColor: 'black',
                      fontFamily: "Helvetica",
                      autoSkip: false,
                        display: true}

                  }],
                    yAxes: [{
                        ticks: {
                          fontFamily: "Helvetica",
                          fontColor: 'black',
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
    };


    var info = L.control({position: 'bottomright'});

    info.onAdd = function(map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function(props) {
        if (props) {
            {
                var label = ['50s', '60s', '70s', '80s', '90s', '00s', '10s'];
                var totData50 = [props.tot1950];
                var totData60 = [props.tot1960];
                var totData70 = [props.tot1970];
                var totData80 = [props.tot1980];
                var totData90 = [props.tot1990];
                var totData00 = [props.tot2000];
                var totData10 = [props.tot2010];
                var stateNAME = [props.NAME];
                var indices = '';
                indices += '<canvas id="myChart" width="300" height="250"></canvas>';
                this._div.innerHTML = indices;
                newChart(label, totData50, totData60, totData70, totData80, totData90, totData00, totData10);
            }
        }
    };

    info.addTo(map);


   d3.queue()
    .defer(d3.csv, 'data/FEMA.csv')
    .defer(d3.json, 'data/REGION4.geojson')
    .await(callback);


  });
};

//create hover effect function
function handleHover(data){
	document.querySelectorAll("svg path").forEach((path, index) => {
    	let row = data[index],
            tot1950 = row.tot1950,
            tot1960 = row.tot1960,
            tot1970 = row.tot1970,
            tot1980 = row.tot1980,
            tot1990 = row.tot1990,
            tot2000 = row.tot2000,
            tot2010 = row.tot2010,
            stateNAME = row.NAME;
      	path.setAttribute("data-tot1950", tot1950);
      	path.setAttribute("data-tot1960", tot1960);
        path.setAttribute("data-tot1970", tot1970);
        path.setAttribute("data-tot1980", tot1980);
        path.setAttribute("data-tot1990", tot1990);
        path.setAttribute("data-tot2000", tot2000);
        path.setAttribute("data-tot2010", tot2010);
      	path.setAttribute("data-NAME", stateNAME);
      	path.addEventListener("mouseenter", handleMouseenter);
      	path.addEventListener("mouseleave", handleMouseleave);
    });
};

//when the page loads, AJAX & call createMap to render map tiles and data.
$(document).ready(init);
function init(){
  	globalOutput = document.querySelector("header output");
    //globalOutput.textContent = 'Census Block: , Location Index: , Walk Index:`';

    createMap();
  	//create map home button
  	$("header button").on("click", function(){
    	globalMap.flyTo([32.38, -84.00], 5.5); //[lat, lng], zoom
    });
};
