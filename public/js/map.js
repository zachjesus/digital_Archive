window.addEventListener('load', function () {
  const map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      sources: {
        watercolor: {
          type: 'raster',
          tiles: [
            'https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg'
          ],
          tileSize: 256,
          maxzoom: 12,  
          attribution: 'Map data &copy',
        },
      },
      layers: [
        {
          id: 'watercolor',
          type: 'raster',
          source: 'watercolor',
        },
      ],
    },
    center: [12.4964, 41.9028],
    zoom: 5,
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-left');

  Papa.parse('collections.csv', {
    download: true,
    header: true,
    complete: function (results) {
      const features = [];

      results.data.forEach((row) => {
        const lat = parseFloat(row.lat);
        const lng = parseFloat(row.long);
        
        if (isNaN(lat) || isNaN(lng)) return;

        features.push({
          type: 'Feature',
          properties: {
            color: row.color || 'blue',
            size: parseFloat(row.size) || 5,
            file: row.file || null,
            isCollectionNode: String(row.isCollectionNode).toLowerCase() === 'true',
          },
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        });
      });

      if (features.length === 0) return;

      map.addSource('nodes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
      });

      map.addLayer({
        id: 'nodes-layer',
        type: 'circle',
        source: 'nodes',
        paint: {
          'circle-radius': ['get', 'size'],
          'circle-color': ['get', 'color'],
        },
      });
    },
    error: function(error) {
      console.error('Error parsing CSV:', error);
    }
  });
});