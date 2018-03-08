var myLat = 0;
var myLng = 0;
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
	zoom: 13, // The larger the zoom number, the bigger the zoom
	center: me,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map;
var marker;
var infowindow = new google.maps.InfoWindow();

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
			outputDiv = document.getElementById("passengers");
			
			// Step 5: Work with the response data
			theString = request.responseText;				

			// Step 5A: Parse the responseText to JavaScript objects
			passengers = JSON.parse(theString);
			outputString = "";
			for (count = 0; count < passengers["passengers"].length; count++) {
				outputString += "<p>" + "username: " + passengers["passengers"][count]["username"]+"</p>";
				outputString += "<p>" + "id: " + passengers["passengers"][count]["_id"]+"</p>";
				outputString += "<p>" + "lattitude: " + passengers["passengers"][count]["lat"]+"</p>";
				outputString += "<p>" + "longitude: " + passengers["passengers"][count]["lng"]+"</p>";
				outputString += "<p>" + "created at: " + passengers["passengers"][count]["created_at"]+"</p>";
				outputString += "<p>"+"------------------------------------------------"+"</p>";

				marker = new google.maps.Marker({
					position: {lat: passengers["passengers"][count]["lat"], lng: passengers["passengers"][count]["lng"]},
					title: passengers["passengers"][count]["username"]
				});
				marker.setMap(map);
					
				// Open info window on click of marker
				google.maps.event.addListener(marker, 'click', function() {
					infowindow.setContent(marker.title);
					infowindow.open(map, marker);
				});
			}
			outputDiv.innerHTML = outputString;

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
	marker = new google.maps.Marker({
		position: me,
		title: "Here I Am!"
	});
	marker.setMap(map);
		
	// Open info window on click of marker
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(marker.title);
		infowindow.open(map, marker);
	});
}