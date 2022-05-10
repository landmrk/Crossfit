mapboxgl.accessToken = 'pk.eyJ1IjoibGFuZG1yayIsImEiOiJjajV1dzZqemkxczA2MndxdHZrN3I0dGhtIn0.OQf_LxW3LV68pDjF4pTxdQ';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/landmrk/ckcd73d8e7sca1imtabjdx8hr',
  zoom: 4,
  pitch: 30
});

map.on('load', function() {
  // We use D3 to fetch the JSON here so that we can parse and use it separately
  // from GL JS's use in the added source. You can use any request method (library
  // or otherwise) that you want.
  d3.json(
    'https://opensheet.elk.sh/1opFPe_w7wU2PMkAWtsvbNWHvZtxzMjM7l2pxne3Qswc/locations',
    function(err, data) {

      const { route,
      reachedRoute,
      challengeMarkers,
      infoMarkers,
      covidMarkers,
      metadata } = data;
      if (err) throw err;

      // set metadata
      localStorage.setItem('metadata', metadata);
      const { daysRemaining, justGiving, distanceRan } = metadata;
      document.getElementById('daysRemaining').innerHTML = daysRemaining;
      document.getElementById('justGiving').innerHTML = justGiving;
      document.getElementById('distanceRan').innerHTML = distanceRan;

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
          'line-color': '#FBDC01',
          'line-opacity': 1,
          'line-width': 8        }
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
          'line-color': '#E5321E',
          'line-opacity': 1,
          'line-width': 8        }
      });

      // setup the viewport
      map.jumpTo({
        'center': routeInit[0],
        'zoom': 4
      });
      map.setPitch(30);

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
      }, 300);

      map.loadImage('../assets/imgs/hotspot-info.png', (error, image) => {
        if (error) throw error;
        map.addImage('info', image);
      });
      map.loadImage('../assets/imgs/hotspot-ball.png', (error, image) => {
        if (error) throw error;
        map.addImage('ball', image);
      });
      map.loadImage('../assets/imgs/hotspot-fact.png', (error, image) => {
        if (error) throw error;
        map.addImage('fact', image);
      });

      setChallengeMarkers(challengeMarkers)
      setInfoMarkers(infoMarkers)
      setCovidMarkers(covidMarkers)

      // Add zoom and rotation controls to the map.
      map.addControl(new mapboxgl.NavigationControl());
    });
    }
  );
function setChallengeMarkers(challengeMarkers) {
      map.addSource('places', {
        'type': 'geojson',
        'data': challengeMarkers,
        'cluster': false
      });

      map.loadImage('../assets/imgs/hotspot-ball.png', (error, image) => {
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

        const { description, image } = e.features[0].properties;
        const copy = `<img src="${image}" width="140" /> <p>${description}</p> <strong>#12Challenges</strong>`;

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

function setInfoMarkers(infoMarkers) {
      map.addSource('infoMarkers', {
        'type': 'geojson',
        'data': infoMarkers,
        'cluster': false
      });

      map.loadImage('../assets/imgs/hotspot-info.png', (error, image) => {
        if (error) throw error;
        map.addImage('hotspot2', image);
      });

      // Add a layer showing the places.
      map.addLayer({
        'id': 'infoMarkers',
        'type': 'symbol',
        'source': 'infoMarkers',
        'layout': {
          'icon-image': 'hotspot2',
          'icon-allow-overlap': true,
          'icon-size': 0.5
        }
      });

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on('click', 'infoMarkers', function(e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        //var description = e.features[0].properties.description;

        const { heading1, heading2, description } = e.features[0].properties;
        const copy = `${heading1} <strong>${heading2}</strong> <p>${description}</p>`;

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
      map.on('mouseenter', 'infoMarkers', function() {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'infoMarkers', function() {
        map.getCanvas().style.cursor = '';
      });
}

function setCovidMarkers(covidMarkers) {
      map.addSource('covidMarkers', {
        'type': 'geojson',
        'data': covidMarkers,
        'cluster': false
      });

      map.loadImage('../assets/imgs/hotspot-fact.png', (error, image) => {
        if (error) throw error;
        map.addImage('hotspot3', image);
      });

      // Add a layer showing the places.
      map.addLayer({
        'id': 'covidMarkers',
        'type': 'symbol',
        'source': 'covidMarkers',
        'layout': {
          'icon-image': 'hotspot3',
          'icon-allow-overlap': true,
          'icon-size': 0.5
        }
      });

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on('click', 'covidMarkers', function(e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        //var description = e.features[0].properties.description1;

        const { description1, description2 } = e.features[0].properties;
        const description = `<p>${description1}</p> <p>${description2}</p>`;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(map);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'covidMarkers', function() {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'covidMarkers', function() {
        map.getCanvas().style.cursor = '';
      });
}