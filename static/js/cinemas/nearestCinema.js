// nearestCinema.js
import { map } from './mapCore.js';

let _nearestCinemaLayer = null;
let _nearestCinemaRouting = null;
let _nearestCloseButton = null; // ⭐ Thêm nút đóng riêng cho nearest

function showNearestCinema() {
    if (!navigator.geolocation) {
        alert("Trình duyệt không hỗ trợ định vị.");
        return;
    }

    navigator.geolocation.getCurrentPosition(function (position) {
        const userLatLng = [position.coords.latitude, position.coords.longitude];
        let nearestLayer = null;
        let minDistance = Infinity;

        const cinemaLayer = window["layer_cinema"];
        if (!cinemaLayer) {
            alert("Lớp 'cinema' chưa được tải.");
            const nearestCheckbox = document.getElementById('nearest');
            if (nearestCheckbox) nearestCheckbox.checked = false;
            return;
        }

        cinemaLayer.eachLayer(function (layer) {
            const cinemaLatLng = layer.getLatLng();
            const distance = map.distance(userLatLng, cinemaLatLng);
            if (distance < minDistance) {
                minDistance = distance;
                nearestLayer = layer;
            }
        });

        const currentGeojsonOpts = window.geojsonOpts;
        if (!currentGeojsonOpts) {
            console.error("geojsonOpts not found on window");
            alert("Lỗi cấu hình hiển thị điểm.");
            return;
        }

        if (nearestLayer) {
            clearNearestCinema();

            const nearestFeature = nearestLayer.feature;
            _nearestCinemaLayer = L.geoJSON(nearestFeature, currentGeojsonOpts).addTo(map);
            map.setView(nearestLayer.getLatLng(), 15);

            const marker = _nearestCinemaLayer.getLayers()[0];
            if (marker && marker.openPopup) {
                marker.openPopup();
            } else {
                console.warn("Could not find marker in nearestCinemaLayer to open popup.");
            }

            if (L.Routing && L.Routing.control) {
                _nearestCinemaRouting = L.Routing.control({
                    waypoints: [L.latLng(userLatLng), nearestLayer.getLatLng()],
                    routeWhileDragging: false,
                    createMarker: () => null,
                }).addTo(map);

                // ⭐ Tạo nút đóng X
                createNearestCloseButton();
            } else {
                console.warn("Leaflet Routing Machine (L.Routing.control) not found.");
            }

        } else {
            alert("Không tìm thấy rạp nào gần bạn.");
            const nearestCheckbox = document.getElementById('nearest');
            if (nearestCheckbox) nearestCheckbox.checked = false;
        }
    }, function () {
        alert("Không thể lấy vị trí hiện tại của bạn.");
        const nearestCheckbox = document.getElementById('nearest');
        if (nearestCheckbox) nearestCheckbox.checked = false;
    });
}

function clearNearestCinema() {
    if (_nearestCinemaLayer) {
        map.removeLayer(_nearestCinemaLayer);
        _nearestCinemaLayer = null;
    }
    if (_nearestCinemaRouting) {
        map.removeControl(_nearestCinemaRouting);
        _nearestCinemaRouting = null;
    }
    if (_nearestCloseButton) {
        _nearestCloseButton.remove();
        _nearestCloseButton = null;
    }
}

// ⭐ Hàm tạo nút đóng "X" cho nearest
function createNearestCloseButton() {
    _nearestCloseButton = document.createElement('button');
    _nearestCloseButton.textContent = '✖';
    _nearestCloseButton.style.position = 'absolute';
    _nearestCloseButton.style.top = '10px';
    _nearestCloseButton.style.right = '10px';
    _nearestCloseButton.style.zIndex = '1001';
    _nearestCloseButton.style.background = 'transparent';
    _nearestCloseButton.style.border = 'none';
    _nearestCloseButton.style.color = '#333';
    _nearestCloseButton.style.fontSize = '18px';
    _nearestCloseButton.style.padding = '5px 10px';
    _nearestCloseButton.style.cursor = 'pointer';
    _nearestCloseButton.style.borderRadius = '3px';
    _nearestCloseButton.style.boxShadow = 'none';

    _nearestCloseButton.addEventListener('click', () => {
        clearNearestCinema();
    });

    const routingContainer = document.querySelector('.leaflet-routing-container');
    if (routingContainer) {
        routingContainer.appendChild(_nearestCloseButton);
    } else {
        map.getContainer().appendChild(_nearestCloseButton);
    }
}

// Gán ra window để file khác dùng
window.showNearestCinema = showNearestCinema;
window.clearNearestCinema = clearNearestCinema;

console.log("Nearest cinema functions assigned to window.");
