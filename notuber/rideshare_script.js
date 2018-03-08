var myLat = 0;
var myLng = 0;
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
	zoom: 18, // The larger the zoom number, the bigger the zoom
	center: me,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map;
var marker;
var me_marker;
var infowindow = new google.maps.InfoWindow();
var closest = 99999999;

function init() {
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	getMyLocation();
}

//gets location and stores coordinates into global variables myLat& myLng, initiates send()
function getMyLocation()
{
	navigator.geolocation.getCurrentPosition(gotLocation);
}
function gotLocation(location)
{
	myLat = location.coords.latitude;
	myLng = location.coords.longitude;
	send();
	renderMap();
}
//sends data to rideshare api, displays passengers in html
function send() 
{
	// Step 1: Create instance of XMLHttpRequest
	var request = new XMLHttpRequest();
	url = "https://jordan-marsh.herokuapp.com/rides";
	params = "username=DAu0hb2i5T&lat=" + myLat + "&lng=" + myLng;
	// Step 2: Set up an HTTP request
	request.open("POST", url, true);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	// Step 3: Set up to handle the HTTP response
	request.onreadystatechange = function() {
		// Request is done and got a response back
		if (request.readyState == 4 && request.status == 200) {

			// Step 5: Work with the response data
			theString = request.responseText;				

			// Step 5A: Parse the responseText to JavaScript objects
			passengers = JSON.parse(theString);
			if (passengers.hasOwnProperty("passengers"))
			{
				for (count = 0; count < passengers["passengers"].length; count++) {
					marker = new google.maps.Marker({
						position: new google.maps.LatLng(passengers["passengers"][count]["lat"], passengers["passengers"][count]["lng"]),
						map: map,
						title: passengers["passengers"][count]["username"],
						icon: 'taxi_passanger.png'
					});	
					// Open info window on click of marker
					google.maps.event.addListener(marker, 'click', (function(marker, count) {
				        return function() {
				          infowindow.setContent("username: " + marker.title + " distance(miles): " + 
				          	calc_distance(myLat,myLng,passengers["passengers"][count]["lat"], passengers["passengers"][count]["lng"]));
				          infowindow.open(map, marker);
				        }
			      	})(marker, count));

					if(calc_distance(myLat,myLng,passengers["passengers"][count]["lat"], passengers["passengers"][count]["lng"])<closest)
					{
						closest = calc_distance(myLat,myLng,passengers["passengers"][count]["lat"], passengers["passengers"][count]["lng"]);
					}
				}
			}
			if (passengers.hasOwnProperty("vehicles"))
			{
				for (count = 0; count < passengers["vehicles"].length; count++) {
					marker = new google.maps.Marker({
						position: new google.maps.LatLng(passengers["vehicles"][count]["lat"], passengers["vehicles"][count]["lng"]),
						map: map,
						title: passengers["vehicles"][count]["username"],
						icon: 'car.png'
					});	
					// Open info window on click of marker
					google.maps.event.addListener(marker, 'click', (function(marker, count) {
				        return function() {
				          infowindow.setContent("username: " + marker.title + " distance(miles): " + 
				          	calc_distance(myLat,myLng,passengers["vehicles"][count]["lat"], passengers["vehicles"][count]["lng"]));
				          infowindow.open(map, marker);
				        }
			      	})(marker, count));

			      	if(calc_distance(myLat,myLng,passengers["vehicles"][count]["lat"], passengers["vehicles"][count]["lng"])<closest)
					{
						closest = calc_distance(myLat,myLng,passengers["vehicles"][count]["lat"], passengers["vehicles"][count]["lng"]);
					}
				}	

			}
		}
	};

	// Step 4: Execute / send the request
	request.send(params);
}

function renderMap() {
	me = new google.maps.LatLng(myLat, myLng);

	// Update map and go there...
	map.panTo(me);
	
	// Create a marker
	me_marker = new google.maps.Marker({
		position: me,
		title: "DAu0hb2i5T",
		icon: 'me.png'
	});
	me_marker.setMap(map);
		
	// Open info window on click of marker
	google.maps.event.addListener(me_marker, 'click', function() {
		infowindow.setContent(me_marker.title + " nearest person distance(miles): " + closest);
		infowindow.open(map, me_marker);
	});
}

function calc_distance(lat1, lon1, lat2, lon2)
{
	Number.prototype.toRadians = function() {
   	return this * Math.PI / 180;
	}
	var R = 6371e3; // metres
	var angle1 = lat1.toRadians();
	var angle2 = lat2.toRadians();
	var delta_angle = (lat2-lat1).toRadians();
	var delta_lon_angle = (lon2-lon1).toRadians();

	var a = Math.sin(delta_angle/2) * Math.sin(delta_angle/2) +
	        Math.cos(angle1) * Math.cos(angle2) *
	        Math.sin(delta_lon_angle/2) * Math.sin(delta_lon_angle/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;
	return d/1609.34;
}