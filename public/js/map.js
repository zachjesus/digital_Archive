// I am keeping this PS command here because it is useful:
// $id = ""; $json = ardrive list-folder --parent-folder-id $id | ConvertFrom-Json; $csv = @(); $json | ForEach-Object { $csv += "$($_.customMetaDataJson.title),blue,8,$($_.dataTxId),," }; $csv | Add-Content collections.csv -Encoding UTF8; Write-Host "Added $($json.Count) files to existing CSV"
window.addEventListener('load', function () {
  const map = L.map('map').setView([41.9028, 12.4964], 5);

  L.tileLayer('https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg', {
    maxZoom: 12,
    attribution: 'Map data &copy'
  }).addTo(map);

  fetch('collections.csv')
    .then(response => response.text())
    .then(csvText => {
      const results = parseCSV(csvText);

      results.forEach((row) => {
        const lat = parseFloat(row.lat);
        const lng = parseFloat(row.long);
        
        if (isNaN(lat) || isNaN(lng)) return;

        const circle = L.circleMarker([lat, lng], {
          color: row.color || 'blue',
          radius: parseFloat(row.size) || 8, // Default size if not specified
          fillOpacity: 0.8,
          weight: 2
        });

        const popupContent = `
        <div class="popup-content">
          <h3>${row.collection}</h3>
          <p><strong>Location:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
          ${row.file ? `
            <div class="file-display">
              <img src="https://arweave.net/${row.file}" 
                   alt="${row.collection}"
                   style="max-width: 250px; max-height: 200px; width: 100%;"
                   onerror="this.src='https://g8way.io/${row.file}'; this.onerror=function(){this.src='https://ar.io/${row.file}'; this.onerror=function(){this.src='https://permagate.io/${row.file}'; this.onerror=null;}}">
              <br>
              <small>
                <a href="https://arweave.net/${row.file}" target="_blank">Main</a> |
                <a href="https://g8way.io/${row.file}" target="_blank">G8way</a> |
                <a href="https://ar.io/${row.file}" target="_blank">AR.IO</a> |
                <a href="https://permagate.io/${row.file}" target="_blank">Permagate</a>
              </small>
            </div>
          ` : ''}
        </div>
      `;

        circle.bindPopup(popupContent);
        circle.addTo(map);
      });
    })
    .catch(error => {
      console.error('Error loading CSV:', error);
    });
});

function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return data;
}