/**
 * @file map-search.js
 * @description Live Donor Map Search interface matching the dark mode screenshot design.
 */

import { MapView } from '../../components/map-view.js';
import { toast } from '../../core/toast.js';

export class MapSearchModule {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.mapView = null;
    this.selectedGroup = 'B+';
    this.selectedRadius = 10;
    this.donors = [
      {
        id: 'donor_a',
        name: 'Donor A.',
        bloodGroup: 'B+',
        level: 'Gold',
        distanceKm: 1.5,
        lat: 22.368,
        lon: 91.821,
        availability: 'Available now',
        badgeType: 'available'
      },
      {
        id: 'donor_m',
        name: 'Donor M.',
        bloodGroup: 'B+',
        level: 'Silver',
        distanceKm: 3.0,
        lat: 22.345,
        lon: 91.842,
        availability: 'Free 6–9 PM',
        badgeType: 'scheduled'
      },
      {
        id: 'donor_k',
        name: 'Donor K.',
        bloodGroup: 'A+',
        level: 'Platinum',
        distanceKm: 4.8,
        lat: 22.378,
        lon: 91.851,
        availability: 'Available now',
        badgeType: 'available'
      },
      {
        id: 'donor_o',
        name: 'Donor T.',
        bloodGroup: 'O+',
        level: 'Legend',
        distanceKm: 6.2,
        lat: 22.332,
        lon: 91.815,
        availability: 'Emergency SOS only',
        badgeType: 'emergency'
      }
    ];
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="map-layout-grid">
        <!-- Left Sidebar (Matching uploaded screenshot) -->
        <aside class="map-sidebar">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-5);">
            <h1 style="font-size:var(--font-size-2xl); font-weight:800;">Donors near you</h1>
            <a href="#/request" class="btn btn-sos btn-sm">SOS Request</a>
          </div>

          <!-- Blood Group Filters -->
          <div class="form-group">
            <label class="form-label">Blood group</label>
            <div class="blood-group-selector" id="mapBloodSelector">
              <button type="button" class="blood-btn ${this.selectedGroup === 'B+' ? 'active' : ''}" data-group="B+">B+</button>
              <button type="button" class="blood-btn ${this.selectedGroup === 'A+' ? 'active' : ''}" data-group="A+">A+</button>
              <button type="button" class="blood-btn ${this.selectedGroup === 'O+' ? 'active' : ''}" data-group="O+">O+</button>
              <button type="button" class="blood-btn ${this.selectedGroup === 'AB+' ? 'active' : ''}" data-group="AB+">AB+</button>
            </div>
          </div>

          <!-- Radius Slider -->
          <div class="form-group" style="margin-bottom:var(--space-6);">
            <div style="display:flex; justify-content:space-between; font-size:var(--font-size-xs); font-weight:700; margin-bottom:6px;">
              <span>Radius: <span id="radiusVal">${this.selectedRadius}</span> km</span>
              <button type="button" id="btnGpsLocate" style="color:var(--color-crimson); font-size:11px; text-decoration:underline;">Use my location</button>
            </div>
            <input type="range" min="1" max="50" value="${this.selectedRadius}" id="sliderRadius" style="width:100%; accent-color:var(--color-crimson);">
          </div>

          <!-- Donor Cards List -->
          <div id="donorsListContainer">
            ${this.renderDonorCards()}
          </div>
        </aside>

        <!-- Right Map View -->
        <main class="map-container" id="mapMountPoint"></main>
      </div>
    `;

    // Initialize Map
    this.mapView = new MapView('mapMountPoint', { radiusKm: this.selectedRadius });
    this.mapView.init();
    this.updateVisibleMarkers();

    this.attachEvents();
  }

  renderDonorCards() {
    const filtered = this.donors.filter(d => 
      (this.selectedGroup === 'ALL' || d.bloodGroup === this.selectedGroup) &&
      d.distanceKm <= this.selectedRadius
    );

    if (filtered.length === 0) {
      return `
        <div class="card" style="text-align:center; padding:var(--space-6); background:var(--color-bg-subtle);">
          <p style="font-size:var(--font-size-sm); color:var(--color-text-secondary); margin-bottom:8px;">No verified donors available in this radius.</p>
          <button type="button" class="btn btn-outline btn-sm" id="btnExpandRadius">Expand to 25 km</button>
        </div>
      `;
    }

    return filtered.map((d, index) => `
      <div class="card" style="margin-bottom:var(--space-4); background:var(--color-bg-subtle);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-weight:700; font-size:var(--font-size-base);">${d.name}</span>
          <span class="badge ${d.badgeType === 'available' ? 'badge-available' : 'badge-urgent'}" style="font-size:11px;">
            ${d.availability}
          </span>
        </div>
        <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:12px;">
          ${d.bloodGroup} • about ${d.distanceKm} km • ${d.level}
        </div>
        <button type="button" class="btn ${index === 0 ? 'btn-primary' : 'btn-outline'} btn-block btn-sm btn-request-donor" data-id="${d.id}" data-name="${d.name}">
          Request donation
        </button>
      </div>
    `).join('');
  }

  updateVisibleMarkers() {
    const filtered = this.donors.filter(d => 
      (this.selectedGroup === 'ALL' || d.bloodGroup === this.selectedGroup) &&
      d.distanceKm <= this.selectedRadius
    );
    this.mapView.setMarkers(filtered);
  }

  attachEvents() {
    // Blood group buttons
    document.querySelectorAll('#mapBloodSelector .blood-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#mapBloodSelector .blood-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedGroup = e.currentTarget.dataset.group;
        this.updateListAndMap();
      });
    });

    // Radius slider
    const slider = document.getElementById('sliderRadius');
    const radiusVal = document.getElementById('radiusVal');
    if (slider && radiusVal) {
      slider.addEventListener('input', (e) => {
        this.selectedRadius = parseInt(e.target.value, 10);
        radiusVal.textContent = this.selectedRadius;
        this.mapView.setRadius(this.selectedRadius);
        this.updateListAndMap();
      });
    }

    // GPS location
    const btnGps = document.getElementById('btnGpsLocate');
    if (btnGps) {
      btnGps.addEventListener('click', () => {
        toast.info('Detecting approximate location...');
        navigator.geolocation?.getCurrentPosition(
          (pos) => {
            this.mapView.setCenter(pos.coords.latitude, pos.coords.longitude);
            toast.success('Location centered to your current district.');
          },
          () => {
            toast.info('Using default center: Chattogram Medical.');
          }
        );
      });
    }

    // Request donation buttons
    this.attachRequestButtons();
  }

  attachRequestButtons() {
    document.querySelectorAll('.btn-request-donor').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const donorName = e.currentTarget.dataset.name;
        toast.success(`Emergency donation request dispatched to ${donorName}! Opening secure coordination chat.`);
        setTimeout(() => {
          window.location.hash = '#/chat';
        }, 800);
      });
    });

    const btnExpand = document.getElementById('btnExpandRadius');
    if (btnExpand) {
      btnExpand.addEventListener('click', () => {
        this.selectedRadius = 25;
        document.getElementById('sliderRadius').value = 25;
        document.getElementById('radiusVal').textContent = '25';
        this.mapView.setRadius(25);
        this.updateListAndMap();
      });
    }
  }

  updateListAndMap() {
    const list = document.getElementById('donorsListContainer');
    if (list) {
      list.innerHTML = this.renderDonorCards();
      this.attachRequestButtons();
    }
    this.updateVisibleMarkers();
  }
}
