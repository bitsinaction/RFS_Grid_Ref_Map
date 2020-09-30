$( document ).ready(function() {

// Create the map
var map = L.map('map').setView([-33, 147], 7);

// create a street map layer and add it to the map, making it the default basemap
let streets = L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' ).addTo( map )

// create a satellite imagery layer
let satellite = L.tileLayer( 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' )

// create a satellite imagery layer
let topo = L.tileLayer( 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' )

// create an object to hold layer names as you want them to appear in the basemap switcher list
let basemapControl = {
  "Standard": streets,
  "Topographic": topo,
  "Satellite": satellite
}

// display the control (switcher list) on the map, by default in the top right corner
L.control.layers( basemapControl ).addTo( map )


// Set up the OSM layer
//L.tileLayer(
//  'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 //   maxZoom: 18
 // }).addTo(map);
 
 //NSW occupies UTM bands J,H and zones 54,55,56
 // 6 degrees wide, 8 degrees high
 //lat long, 
 //n, e

 var northingRange = [58,59,60,61,62,63,64,65,66,67,68];
 var eastingRange = [2,3,4,5,6,7];
 var zones = [54,55,56];//vertical columns of utm divisions
 var zoneCoords = [//top right//bottom right//bottom left//top left
			 [[-28, 144], [-36, 144], [-34.2, 141], [-28, 141]], // [[-28, 144], [-38, 144], [-38, 138], [-28, 138]], 
 			 [[-28, 150], [-38, 150], [-36, 144], [-28, 144]], //[[-28, 150], [-38, 150], [-38, 144], [-28, 144]],
 			 [[-28, 154],[-30, 154],  [-38, 150], [-28, 150]]// [[-28, 156], [-38, 156], [-38, 150], [-28, 150]]
 			  ];
	  

 $.each(zones, function(i, zone){ 
 var grids = []; 
		 //draw utm 100kmx100km grids
		 $.each(northingRange, function(z, e){//for each utm horizontal line @ 100km increments		 
			var northing = e*100000;		 
			  $.each(eastingRange, function(z, e){//for each utm vertical line @ 100km increments					  
					  var easting = e*100000;
					  grids.push([//anticlockwise from bottom left
								L.utm({x: easting, y: northing, zone: zone, southHemi: true}).latLng(), //bottom left			  
								L.utm({x: easting+100000, y: northing, zone: zone, southHemi: true}).latLng(), //bottom right			  
								L.utm({x: easting+100000, y: northing+100000, zone: zone, southHemi: true}).latLng(),//top right
								L.utm({x: easting, y: northing+100000, zone: zone, southHemi: true}).latLng(), //top left
								]); 
			 }); 
		 }); 
		 
	  var gridPoly = L.polygon(grids
		//,{color: 'blue', fillColor: 'transparent', weight: 1}
		)//.addTo(map); 	
		
		  
		var edgePoly = L.polygon([
			zoneCoords[i]
		],
		{color: 'red', fillColor: 'transparent', weight: 1}
		).addTo(map); 
		
		var turfMulti = turf.multiLineString(gridPoly.toGeoJSON().geometry.coordinates);
		
		var cropped = turf.intersect(edgePoly.toGeoJSON(), turfMulti);	
		
		function gridStyle(){
		  return {
			weight: 1,		
			color: 'blue',
			dashArray: '3',			
		 }
		};		
			
		L.geoJson(cropped, {
			style: {
				weight: 1,		
				color: 'blue',
				dashArray: '3',			
			 }
		 }).addTo(map);		
			
});   



function plot(inputX, inputY, title){
  
 $.each(zones, function(i, zone){ 

	if(!$('#'+zone).is(':checked'))return true;

	var points = [];

		 //draw utm 100kmx100km grids
		 $.each(northingRange, function(i, e){//for each utm horizontal line @ 100km increments		 
			
			var northing = e*100000;		 
			 
			  $.each(eastingRange, function(i, e){//for each utm vertical line @ 100km increments					  
					  var easting = e*100000;
					
					  var item = L.utm({x: easting+(inputX*100), y: northing+(inputY*100), zone: zone, southHemi: true});
					  var normalized = item.normalize();
				
					  var coord = normalized.latLng();

					  points.push( [coord.lng, coord.lat] );

			 }); 
			 
		 }); 
		 
		var edgePoly = L.polygon([
				zoneCoords[i]
			]);					 

		var turfPoints = turf.points(points);
		
		var turfBounds =  turf.polygon(
			edgePoly.toGeoJSON().geometry.coordinates
		);
	
		var cropped = turf.pointsWithinPolygon(turfPoints,turfBounds );			
		
		
		 $.each(cropped.features, function(i, e){
		
					  var popup = L.popup({autoClose: false, closeOnClick: false}).setContent(title);	
						
					  L.marker([e.geometry.coordinates[1],e.geometry.coordinates[0]]).addTo(map).bindPopup(popup)//.openPopup();		 
		 });

			
});   
  

}
$('#easting').keyup(function(){
	if($('#easting').val().length == 3)$('#northing').focus();
})
$('#northing').keyup(function(e){
if(e.keyCode == 13)$("#plot").click();//enter
})

$("#plot").on("click",function(){

	var date = new Date();
	var time = date.toLocaleTimeString();

	var inputX = parseInt($('#easting').val());
	var inputY = parseInt($('#northing').val());
	if(!inputX || !inputY)return;
	  
	$('#easting').val("");
 
	$('#northing').val("");    
 
	var title = inputX+" "+inputY+"<br />"+time;
  
	plot(inputX, inputY, title);  

})
	
$("#clear").on("click",function(){
	$("#readme").toggle();
});
	
$("#about").on("click",function(){
	$(".leaflet-marker-icon").remove();
	$(".leaflet-popup").remove();
	$(".leaflet-marker-shadow").remove();
});	
	   
});
