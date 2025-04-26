// mapCore.js
import { config, lat, lng, zoom, zoomControlPosition } from './mapConfig.js';

// Khởi tạo map
export const map = L.map("map", config).setView([lat, lng], zoom);

// Thêm TileLayer
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Thêm nút Zoom
L.control.zoom({
    position: zoomControlPosition
}).addTo(map);

// ✅ Custom Fullscreen Button thay vì dùng plugin
const FullscreenCustomControl = L.Control.extend({
    onAdd: function (map) {
        const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');

        btn.innerHTML = '⛶';
        btn.style.backgroundColor = 'white';
        btn.style.width = '34px';
        btn.style.height = '34px';
        btn.style.fontSize = '20px';
        btn.title = 'Toàn màn hình';

        L.DomEvent.disableClickPropagation(btn);

        btn.onclick = function () {
            if (!document.fullscreenElement) {
                map.getContainer().requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        };

        return btn;
    },
    onRemove: function () { }
});

// Thêm custom fullscreen control vào vị trí giống zoom
map.addControl(new FullscreenCustomControl({ position: zoomControlPosition }));

// Các biến khác
export let userLocationMarker = null;
export let userLocationCircle = null;
export let nearestCinemaLayer = null;
export let nearestCinemaRouting = null;
export let routingControl = null;

// Layer group gốc
export const poiLayers = L.layerGroup().addTo(map);

console.log("Map core initialized.");

