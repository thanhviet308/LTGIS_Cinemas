// mapConfig.js
// Giữ nguyên các biến cấu hình gốc
export const config = {
    minZoom: 7,
    maxZoom: 18,
    fullscreenControl: false, // Giữ nguyên, dù bạn cần plugin leaflet-fullscreen
    zoomControl: false,
};

export const zoom = 18;
export const lat = 10.8231;
export const lng = 106.6297;

// Các tên layer và nút gốc
export const layersButton = "all layers";
export const arrayLayers = ["cinema", "nearest"]; // Giữ nguyên tên "nearest"
// mapConfig.js
export const zoomControlPosition = "topleft"; // Di chuyển nút zoom sang bên phải
