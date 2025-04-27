import { map } from './mapCore.js';
import { setCinemaLookup } from './cinemaSearch.js';

// ----- Sidebar handler -----
function toggleSidebar(action, content = '') {
    const sidebar = document.getElementById("sidebar");
    const sidebarContent = document.getElementById("sidebar-content");
    const mapEl = document.getElementById("map");
    const leafletLeft = document.querySelector(".leaflet-left");

    if (action === 'open') {
        sidebarContent.innerHTML = content;
        sidebar.classList.add("open");
        mapEl.classList.add("shifted");
        if (leafletLeft) leafletLeft.classList.add("shifted");
    } else {
        sidebar.classList.remove("open");
        mapEl.classList.remove("shifted");
        if (leafletLeft) leafletLeft.classList.remove("shifted");
    }

    setTimeout(() => {
        map.invalidateSize();
    }, 300);
}

// Close sidebar button listener
document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("sidebar-close-btn");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => toggleSidebar('close'));
    }
});

// Movie selection handler
function handleMovieSelect(event, feature) {
    const selectedName = event.target.value;
    const detailDiv = document.getElementById(`movie-detail-${feature.id}`);
    const showtimes = feature?.properties?.lich_chieu || [];

    if (selectedName === "" || !feature) {
        detailDiv.innerHTML = "";
        return;
    }

    const matchingMovies = showtimes.filter(item => item.ten_phim === selectedName);
    if (matchingMovies.length > 0) {
        const now = new Date();  // Thời gian hiện tại (giờ người dùng)
        console.log("Current time:", now);

        const futureShowtimes = matchingMovies.filter(m => {
            // Tách giờ chiếu và ngày
            const [time, date] = m.gio_chieu.split(" ");  // Tách giờ và ngày
            if (!time || !date) return false;  // Kiểm tra xem có đủ thông tin không

            const [hours, minutes] = time.split(":").map(Number);
            const [day, month, year] = date.split("-").map(Number);

            // Kiểm tra xem có đủ ngày giờ không
            if (hours == null || minutes == null || day == null || month == null || year == null) {
                console.error("Invalid time or date:", m.gio_chieu);
                return false;
            }

            // Tạo đối tượng Date từ giờ chiếu và ngày
            const showtime = new Date(year, month - 1, day, hours, minutes);  // Lưu ý tháng bắt đầu từ 0
            console.log("Showtime:", showtime);

            // So sánh giờ chiếu với thời gian hiện tại
            return showtime > now;
        });

        if (futureShowtimes.length > 0) {
            detailDiv.innerHTML = generateMovieDetails(matchingMovies[0], futureShowtimes);
        } else {
            detailDiv.innerHTML = generateNoShowtimeMessage(matchingMovies[0]);
        }
    } else {
        detailDiv.innerHTML = "<em>Không có thông tin chi tiết.</em>";
    }
}

// Generate movie details when showtimes are available
function generateMovieDetails(movie, showtimes) {
    return `
        <div><img src="${movie.anh_phim}" alt="Cinema Image" style="width: 100%; height: auto; display: block; border-radius: 8px; margin-bottom: 10px;" /></div>
        <div style="font-size: 22px; font-weight: bold; margin-bottom: 8px;">🎬 ${movie.ten_phim}</div>
        <div style="font-size: 18px; margin-bottom: 5px;"><b>Thể loại:</b> ${movie.the_loai}</div>
        <div style="font-size: 18px; margin-bottom: 10px;"><b>Mô tả:</b> ${movie.mo_ta_phim}</div>
        <div style="font-size: 16px; margin-bottom: 5px;"><b>🎟️ Các suất chiếu còn lại:</b></div>
        <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px;">
            ${showtimes.map(m => `
                <div style="
                    background-color: #f0f0f0;
                    border: 1px solid #ccc;
                    padding: 6px 10px;
                    border-radius: 20px;
                    font-size: 14px;
                    color: #333;
                    display: inline-block;
                ">${m.gio_chieu}</div>
            `).join("")}
        </div>
    `;
}

// Message when no showtimes are available
function generateNoShowtimeMessage(movie) {
    return `
        <div><img src="${movie.anh_phim}" alt="Cinema Image" style="width: 100%; height: auto; display: block; border-radius: 8px; margin-bottom: 10px;" /></div>
        <div style="font-size: 22px; font-weight: bold; margin-bottom: 8px;">🎬 ${movie.ten_phim}</div>
        <div style="font-size: 18px; margin-bottom: 5px;"><b>Thể loại:</b> ${movie.the_loai}</div>
        <div style="font-size: 18px; margin-bottom: 10px;"><b>Mô tả:</b> ${movie.mo_ta_phim}</div>
        <div style="font-size: 16px; margin-bottom: 5px;"><b>🎟️ Các suất chiếu còn lại:</b> <i>Không còn suất chiếu nào hôm nay.</i></div>
    `;
}

// Cinema marker setup
const cinemaLookup = {};

const geojsonOpts = {
    pointToLayer: function (feature, latlng) {
        cinemaLookup[feature.properties.name] = { latlng, feature };

        const marker = L.marker(latlng, {
            icon: L.divIcon({
                className: "cinema-icon",
                html: "<span class='emoji'>🎥</span>",
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -25],
            }),
        });

        // Attach feature to marker for later use
        marker.feature = feature;

        // Marker click event
        marker.on("click", function (e) {
            const feature = e.target.feature;
            const latlng = e.latlng;
            const lichChieu = feature.properties.lich_chieu || [];

            let dropdownHtml = "<em style='font-size: 16px;'>🎥 Chưa có lịch chiếu</em>";
            if (lichChieu.length > 0) {
                const uniqueMovies = [...new Set(lichChieu.map(item => item.ten_phim))];

                dropdownHtml = generateMovieDropdown(uniqueMovies, feature.id);
            }

            const sidebarContent = generateSidebarContent(feature, dropdownHtml, latlng);

            toggleSidebar('open', sidebarContent);

            const selectEl = document.getElementById(`movie-select-${feature.id}`);
            if (selectEl) {
                selectEl.addEventListener("change", (event) => handleMovieSelect(event, feature));
            }
        });

        return marker;
    },
};

// Generate dropdown for movies
function generateMovieDropdown(uniqueMovies, featureId) {
    return `
        <div style="margin-top: 15px;">
            <label for="movie-select-${featureId}" style="font-weight: bold; font-size: 18px;">🎬 Danh sách phim:</label><br>
            <select id="movie-select-${featureId}" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 6px; border: 1px solid #ccc; font-size: 16px;">
                <option value="">-- Chọn phim --</option>
                ${uniqueMovies.map(name => `<option value="${name}">${name}</option>`).join("")}
            </select>
            <div id="movie-detail-${featureId}" style="margin-top: 15px; font-size: 0.95em;"></div>
        </div>
    `;
}

// Generate sidebar content
function generateSidebarContent(feature, dropdownHtml, latlng) {
    return `
        <div style="padding: 10px;">
            <div style="margin-bottom: 10px;">
                <img src="${feature.properties.image}" alt="Cinema Image" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);" />
            </div>
            <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">🍿 ${feature.properties.name}</h2>
            <div style="font-size: 14px; margin-bottom: 5px;">
                <strong>🏠 Địa chỉ:</strong> <span style="font-style: normal;">${feature.properties.address}</span>
            </div>
            <div style="font-size: 14px; margin-bottom: 12px;">
                <strong>📝 Mô tả:</strong> <span style="font-style: normal;">${feature.properties.description || ''}</span>
            </div>
            ${dropdownHtml}
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="window.routeToDestination([${latlng.lat}, ${latlng.lng}])" style="background-color: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; cursor: pointer;">
                    📍 Chỉ đường
                </button>
            </div>
        </div>
    `;
}


window.geojsonOpts = geojsonOpts;
window.handleMovieSelect = handleMovieSelect;
window.toggleSidebar = toggleSidebar;
setCinemaLookup(cinemaLookup);

console.log("✅ Layer setup (geojsonOpts) done.");
