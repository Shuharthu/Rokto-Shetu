/**
 * @file map-view.js
 * @description Interactive Leaflet / Canvas map view with blood group pins and privacy radius circle.
 */

export class MapView {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.center = options.center || { lat: 22.3592, lon: 91.8285 }; // Chattogram default
    this.radiusKm = options.radiusKm || 10;
    this.markers = [];
    this.leafletMap = null;
    this.radiusCircle = null;
    this.useFallback = false;
  }

  init() {
    if (!this.container) return;

    if (typeof window.L !== 'undefined') {
      try {
        this.leafletMap = window.L.map(this.container.id).setView([this.center.lat, this.center.lon], 13);
        
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.leafletMap);

        this.drawLeafletRadius();
      } catch (err) {
        console.warn('Leaflet initialization failed, switching to high-fidelity grid canvas:', err);
        this.renderFallbackGrid();
      }
    } else {
      this.renderFallbackGrid();
    }
  }

  renderFallbackGrid() {
    this.useFallback = true;
    this.container.innerHTML = `
      <div style="position:relative; width:100%; height:100%; background:#0B0B0E; display:flex; align-items:center; justify-content:center; overflow:hidden;">
        <!-- Canvas Grid Background -->
        <svg id="fallbackSvg" width="100%" height="100%" style="position:absolute; inset:0;">
          <defs>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridPattern)" />
          
          <!-- Stylized Road Line Graphic (Matches uploaded screenshot) -->
          <path d="M 100 450 L 500 150 L 800 180" fill="none" stroke="rgba(255, 255, 255, 0.06)" stroke-width="48" stroke-linecap="round"/>
          <path d="M 450 80 L 350 550" fill="none" stroke="rgba(255, 255, 255, 0.06)" stroke-width="36" stroke-linecap="round"/>

          <!-- Center User Node -->
          <circle cx="50%" cy="50%" r="180" fill="rgba(217, 4, 41, 0.06)" stroke="#D90429" stroke-width="1.5" stroke-dasharray="5 5" class="radius-pulse-circle"/>
          <circle cx="50%" cy="50%" r="7" fill="#3B82F6" stroke="#FFFFFF" stroke-width="3"/>
          
          <!-- Interactive Donor Pin Layer -->
          <g id="svgDonorPins"></g>
        </svg>

        <!-- Privacy Banner -->
        <div class="map-disclaimer">
          Locations are approximate. Exact contact is shared after a donor accepts.
        </div>
      </div>
    `;
  }

  drawLeafletRadius() {
    if (!this.leafletMap) return;
    if (this.radiusCircle) this.leafletMap.removeLayer(this.radiusCircle);

    this.radiusCircle = window.L.circle([this.center.lat, this.center.lon], {
      color: '#D90429',
      fillColor: '#D90429',
      fillOpacity: 0.08,
      dashArray: '6, 6',
      radius: this.radiusKm * 1000
    }).addTo(this.leafletMap);
  }

  setCenter(lat, lon) {
    this.center = { lat, lon };
    if (this.leafletMap) {
      this.leafletMap.setView([lat, lon], 13);
      this.drawLeafletRadius();
    }
  }

  setRadius(radiusKm) {
    this.radiusKm = radiusKm;
    if (this.leafletMap) {
      this.drawLeafletRadius();
    }
  }

  setMarkers(donors) {
    this.markers = donors;

    if (this.useFallback) {
      const g = document.getElementById('svgDonorPins');
      if (!g) return;

      // Render donors onto the SVG relative to center
      const centerX = this.container.clientWidth / 2 || 400;
      const centerY = this.container.clientHeight / 2 || 350;

      g.innerHTML = donors.map((d, i) => {
        // Calculate offset based on fuzzed GPS coordinates
        const offsetX = (d.lon - this.center.lon) * 2000;
        const offsetY = (this.center.lat - d.lat) * 2000;
        const x = centerX + offsetX;
        const y = centerY + offsetY;

        const color = d.bloodGroup === 'B+' ? '#D90429' :
                      d.bloodGroup === 'A+' ? '#2A9D8F' :
                      d.bloodGroup === 'O+' ? '#8B5CF6' : '#3B82F6';

        return `
          <g transform="translate(${x}, ${y})" style="cursor:pointer;" class="svg-pin" data-id="${d.id}">
            <circle cx="0" cy="0" r="16" fill="${color}" stroke="#FFFFFF" stroke-width="2.5" />
            <text x="0" y="5" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="800">${d.bloodGroup}</text>
          </g>
        `;
      }).join('');
      return;
    }

    if (this.leafletMap) {
      // Clear previous markers
      // In Leaflet mode, add HTML DivIcons
      donors.forEach(d => {
        const markerClass = d.bloodGroup === 'B+' ? 'marker-b-plus' :
                            d.bloodGroup === 'A+' ? 'marker-a-plus' :
                            d.bloodGroup === 'O+' ? 'marker-o-plus' : 'marker-ab-plus';

        const customIcon = window.L.divIcon({
          className: `donor-marker ${markerClass}`,
          html: d.bloodGroup,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const m = window.L.marker([d.lat, d.lon], { icon: customIcon }).addTo(this.leafletMap);
        m.bindPopup(`<b>${d.name} (${d.bloodGroup})</b><br>${d.availability}<br>Distance: approx ${d.distanceKm} km`);
      });
    }
  }
}
