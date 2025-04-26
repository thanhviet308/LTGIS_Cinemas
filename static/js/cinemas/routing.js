import { map } from './mapCore.js';

let _routingControl = null;
let _closeButton = null; // ⭐ Thêm biến lưu nút đóng

function routeToDestination(destination) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Xóa route và nút cũ nếu có
                clearRoute();

                if (L.Routing && L.Routing.control) {
                    _routingControl = L.Routing.control({
                        waypoints: [L.latLng(userLat, userLng), L.latLng(destination)],
                        routeWhileDragging: true,
                        createMarker: () => null,
                    }).addTo(map);

                    // Tạo nút "X" đóng
                    createCloseButton();
                } else {
                    console.warn("Leaflet Routing Machine (L.Routing.control) not found.");
                    alert("Lỗi: Tính năng chỉ đường chưa sẵn sàng.");
                }

            },
            function () {
                alert("Không thể lấy vị trí của bạn!");
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        alert("Trình duyệt của bạn không hỗ trợ định vị.");
    }
}

// ➡️ Hàm clearRoute() cũng xóa luôn nút đóng
function clearRoute() {
    if (_routingControl) {
        map.removeControl(_routingControl);
        _routingControl = null;
    }
    if (_closeButton) {
        _closeButton.remove();
        _closeButton = null;
    }
}

// ⭐ Hàm tạo nút "X" ở góc bên phải
function createCloseButton() {
    _closeButton = document.createElement('button');
    _closeButton.textContent = '✖'; // Dấu X
    _closeButton.style.position = 'absolute';
    _closeButton.style.top = '10px'; // Đặt nó ở góc cao bên trên
    _closeButton.style.right = '10px'; // Đặt nó ở góc phải
    _closeButton.style.zIndex = '1001';
    _closeButton.style.background = 'transparent'; // Làm nền nút trong suốt
    _closeButton.style.border = 'none'; // Xóa viền nút
    _closeButton.style.color = '#333'; // Màu chữ tối hơn
    _closeButton.style.fontSize = '18px'; // Đặt kích thước chữ hợp lý
    _closeButton.style.padding = '5px 10px'; // Tăng khoảng cách để dễ bấm
    _closeButton.style.cursor = 'pointer';
    _closeButton.style.borderRadius = '3px'; // Bo góc nhẹ
    _closeButton.style.boxShadow = 'none'; // Xóa bỏ bóng, làm nó mềm mại hơn

    _closeButton.addEventListener('click', () => {
        clearRoute();
    });

    // Đảm bảo nút "X" nằm trong phần container của chỉ đường
    const routingContainer = document.querySelector('.leaflet-routing-container');
    if (routingContainer) {
        routingContainer.appendChild(_closeButton);
    } else {
        map.getContainer().appendChild(_closeButton);
    }
}

// Thêm CSS để tăng chiều rộng của bảng chỉ đường
const style = document.createElement('style');
style.innerHTML = `
    /* Tăng chiều rộng của bảng chỉ đường */
    .leaflet-routing-container {
        width: 400px !important; /* Tăng chiều rộng bảng chỉ đường thêm một chút */
    }
`;

document.head.appendChild(style);

// Gán ra window để file khác dùng
window.routeToDestination = routeToDestination;
window.clearRoute = clearRoute;

console.log("Routing functions assigned to window.");
