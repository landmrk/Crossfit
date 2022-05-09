mapboxgl.accessToken = 'pk.eyJ1IjoibGFuZG1yayIsImEiOiJjajV1dzZqemkxczA2MndxdHZrN3I0dGhtIn0.OQf_LxW3LV68pDjF4pTxdQ';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/landmrk/ckcd73d8e7sca1imtabjdx8hr',
  zoom: 8,
  center: [-2.230155, 53.789061],
  pitch: 1
});

map.on('load', function() {
  // We use D3 to fetch the JSON here so that we can parse and use it separately
  // from GL JS's use in the added source. You can use any request method (library
  // or otherwise) that you want.
  d3.json(
    'https://zq3ltesiy7.execute-api.us-east-1.amazonaws.com/dev/getLocations',
    function(err, data) {

      const { route,
      reachedRoute,
      mapFacts,
      metadata } = data;
      if (err) throw err;

      // save full coordinate list for later
      const { coordinates } = reachedRoute.features[0].geometry;

      // Where we initialise the line
      const routeInit = [coordinates[0]];

      // Copy route into mutable variable
      let routeState = reachedRoute;

      // overwrite the coords to just contain init position
      // we add the rest back later
      routeState.features[0].geometry.coordinates = routeInit;

      map.addSource('routeStatic', {
        type: 'geojson',
        data: route
      });

      map.addLayer({
        'id': 'routeStatic',
        'type': 'line',
        'source': 'routeStatic',
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': '#fff',
          'line-opacity': 0.8,
          'line-width': 6        }
      });
      // add it to the map
      map.addSource('trace', {
        type: 'geojson',
        data: routeState
      });

      map.addLayer({
        'id': 'trace',
        'type': 'line',
        'source': 'trace',
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': '#50C9A4',
          'line-opacity': 1,
          'line-width': 6        }
      });

      // setup the viewport
      map.jumpTo({
        'center': routeInit[1],
        'zoom': 8
      });
      map.setPitch(1);

      //on a regular basis, add more coordinates from the saved list and update the map
      var i = 0;
      var timer = window.setInterval(function() {
        if (i < coordinates.length) {
          routeState.features[0].geometry.coordinates.push(
            coordinates[i]
          );
          map.getSource('trace').setData(routeState);

          map.panTo(coordinates[i]);
          i++;
        } else {
          window.clearInterval(timer);
        }
      }, 2500);

      map.loadImage('../assets/imgs/hotspot.png', (error, image) => {
        if (error) throw error;
        map.addImage('info', image);
      });

      setmapFacts(mapFacts)

      // Add zoom and rotation controls to the map.
      map.addControl(new mapboxgl.NavigationControl());
    });
    }
  );
function setmapFacts(mapFacts) {
      map.addSource('places', {
        'type': 'geojson',
        'data': mapFacts,
        'cluster': false
      });

      map.loadImage('../assets/imgs/hotspot.png', (error, image) => {
        if (error) throw error;
        map.addImage('hotspot', image);
      });

      // Add a layer showing the places.
      map.addLayer({
        'id': 'places',
        'type': 'symbol',
        'source': 'places',
        'layout': {
          'icon-image': 'hotspot',
          'icon-allow-overlap': true,
          'icon-size': 0.5,
          "icon-offset": [0, -77],
        }
      });

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on('click', 'places', function(e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        //var description = e.features[0].properties.description;

        const { figure, icon, poi, location } = e.features[0].properties;
        const copy = `<h4 style="margin-bottom:5px">Location</h4> <p>${location}</p> <h4 style="margin-bottom:5px">Tour Date</h4> <p>${poi}</p>`;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(copy)
          .addTo(map);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'places', function() {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'places', function() {
        map.getCanvas().style.cursor = '';
      });
}
