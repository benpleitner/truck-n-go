function initMap() {
	// Create a map object and specify the DOM element for display.
	var map = new google.maps.Map(document.getElementById('map'), {
		center: new google.maps.LatLng(39.9522, -75.1932),
		scrollwheel: false,
		zoom: 16
	});

	google.maps.event.addListener(map, 'click', function(event) {
		var latitude = event.latLng.lat();
		var longitude = event.latLng.lng();

		console.log("COORDINATES: (" + latitude + ", " + longitude + ")");
	});
}

initMap()