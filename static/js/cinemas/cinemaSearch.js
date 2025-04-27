import { map } from './mapCore.js';
import { zoom } from './mapConfig.js';

let cinemaLookup = {};
let currentUserLocation = null;
let distanceCache = {}; // Thêm cache để lưu kết quả đã tính

export function setCinemaLookup(data) {
    cinemaLookup = data;
}

export function setCurrentUserLocation(latlng) {
    currentUserLocation = latlng;
    distanceCache = {}; // Reset cache khi vị trí người dùng thay đổi
}

// ⭐ Tối ưu hàm này để tính khoảng cách nhanh hơn
function getRouteDistance(start, end, callback) {
    // Kiểm tra cache trước
    const cacheKey = `${start.lat},${start.lng}-${end.lat},${end.lng}`;
    if (distanceCache[cacheKey]) {
        callback(distanceCache[cacheKey]);
        return;
    }

    const router = L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        timeout: 5000 // Thêm timeout để tránh request treo
    });

    router.route([
        L.Routing.waypoint(L.latLng(start.lat, start.lng)),
        L.Routing.waypoint(L.latLng(end.lat, end.lng))
    ], (err, routes) => {
        if (!err && routes && routes.length > 0) {
            const distanceMeters = routes[0].summary.totalDistance;
            // Lưu vào cache
            distanceCache[cacheKey] = distanceMeters;
            callback(distanceMeters);
        } else {
            console.error('Routing error:', err);
            callback(null);
        }
    });
}

// ⭐ Thêm hàm kiểm tra trùng lặp kết quả
function isDuplicateResult(results, movie, cinemaName) {
    return results.some(result => result.movie === movie && result.cinemaName === cinemaName);
}

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("cinema-search");
    const resultBox = document.getElementById("search-results");

    if (!input) return;

    const style = document.createElement("style");
    style.textContent = `#search-results {
        border: 1px solid #ccc;
        max-height: 200px;
        overflow-y: auto;
        position: absolute;
        background-color: white;
        z-index: 1000;
        width: 100%;
    }

    #search-results div {
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        transition: background-color 0.2s;
    }

    #search-results div:hover {
        background-color: #f0f0f0;
    }`;
    document.head.appendChild(style);

    let lastMovieSearchIds = new Set();
    let pendingRequests = 0;
    const MAX_CONCURRENT_REQUESTS = 3;
    let requestQueue = [];
    let results = []; // Mảng lưu các kết quả tìm kiếm

    function processQueue() {
        if (requestQueue.length === 0 || pendingRequests >= MAX_CONCURRENT_REQUESTS) return;

        while (pendingRequests < MAX_CONCURRENT_REQUESTS && requestQueue.length > 0) {
            const req = requestQueue.shift();
            pendingRequests++;

            getRouteDistance(req.userLocation, req.cinemaLocation, (distanceMeters) => {
                pendingRequests--;

                if (distanceMeters !== null) {
                    const distanceKm = (distanceMeters / 1000).toFixed(2);
                    req.distance = distanceKm; // Thêm khoảng cách vào mỗi request
                    req.element.textContent = `${req.movie} (${req.cinema}) - ${distanceKm} km`;
                } else {
                    req.element.textContent = `${req.movie} (${req.cinema}) - Không tính được khoảng cách`;
                }

                // Thêm kết quả vào mảng sau khi tính xong khoảng cách
                // Tránh trùng lặp
                if (!isDuplicateResult(results, req.movie, req.cinema)) {
                    results.push({ div: req.element, movie: req.movie, cinemaName: req.cinema, distance: req.distance });
                }

                processQueue(); // Xử lý request tiếp theo trong hàng đợi

                // Nếu tất cả các request đã được xử lý, sắp xếp và hiển thị kết quả
                if (requestQueue.length === 0 && pendingRequests === 0) {
                    // Sắp xếp kết quả theo khoảng cách
                    results.sort((a, b) => (parseFloat(a.distance) || 0) - (parseFloat(b.distance) || 0));

                    // Cập nhật lại kết quả tìm kiếm
                    resultBox.innerHTML = "";
                    results.forEach(result => resultBox.appendChild(result.div));
                }
            });
        }
    }

    input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        resultBox.innerHTML = "";
        lastMovieSearchIds.clear();
        requestQueue = [];
        results = []; // Reset lại kết quả khi bắt đầu tìm kiếm mới

        if (query === "") {
            return;
        }

        const unique = new Set();

        Object.keys(cinemaLookup).forEach(cinemaName => {
            const { feature, latlng } = cinemaLookup[cinemaName];

            if (!feature) return;

            if (cinemaName.toLowerCase().includes(query)) {
                const key = 'cinema-' + cinemaName;
                if (!unique.has(key)) {
                    unique.add(key);

                    const div = document.createElement("div");
                    div.textContent = cinemaName;

                    div.addEventListener("click", () => {
                        input.value = cinemaName;
                        resultBox.innerHTML = "";
                        map.setView(latlng, zoom);
                        waitAndFireMarker(feature.id);
                    });

                    resultBox.appendChild(div);
                }
            }

            if (feature.properties && feature.properties.movies) {
                feature.properties.movies.forEach(movie => {
                    if (movie.toLowerCase().includes(query)) {
                        const key = 'movie-' + movie + '-' + cinemaName;
                        if (unique.has(key)) return;
                        unique.add(key);

                        const div = document.createElement("div");
                        div.textContent = `${movie} (${cinemaName}) - Đang tính khoảng cách...`;

                        div.addEventListener("click", () => {
                            input.value = `${movie} (${cinemaName})`;
                            resultBox.innerHTML = "";
                            map.setView(latlng, zoom);
                            waitAndFireMarker(feature.id);
                        });

                        resultBox.appendChild(div);

                        if (currentUserLocation && latlng) {
                            requestQueue.push({
                                userLocation: currentUserLocation,
                                cinemaLocation: latlng,
                                element: div,
                                movie: movie,
                                cinema: cinemaName
                            });
                        } else {
                            div.textContent = `${movie} (${cinemaName}) - Không xác định vị trí`;
                        }
                    }
                });
            }
        });

        // Bắt đầu xử lý hàng đợi
        processQueue();
    });

    document.addEventListener("click", (e) => {
        if (!resultBox.contains(e.target) && e.target !== input) {
            resultBox.innerHTML = "";
        }
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                input.dispatchEvent(new Event('input'));
            },
            (error) => {
                console.warn("Không thể lấy vị trí người dùng:", error);
                alert("Không thể lấy vị trí của bạn. Vui lòng cấp quyền truy cập vị trí.");
            }
        );
    } else {
        console.warn("Trình duyệt không hỗ trợ geolocation.");
        alert("Trình duyệt không hỗ trợ xác định vị trí.");
    }
});
