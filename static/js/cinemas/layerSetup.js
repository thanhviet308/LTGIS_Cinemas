import { map } from './mapCore.js';
import { setCinemaLookup } from './cinemaSearch.js';

// ----- Sidebar handler -----
function openSidebar(content) {
    const sidebar = document.getElementById("sidebar");
    const sidebarContent = document.getElementById("sidebar-content");
    const mapEl = document.getElementById("map");

    sidebarContent.innerHTML = content;
    sidebar.classList.add("open");
    mapEl.classList.add("shifted");

    const leafletLeft = document.querySelector(".leaflet-left");
    if (leafletLeft) {
        leafletLeft.classList.add("shifted");
    }

    setTimeout(() => {
        map.invalidateSize();
    }, 300);
}

function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mapEl = document.getElementById("map");

    sidebar.classList.remove("open");
    mapEl.classList.remove("shifted");

    const leafletLeft = document.querySelector(".leaflet-left");
    if (leafletLeft) {
        leafletLeft.classList.remove("shifted");
    }

    setTimeout(() => {
        map.invalidateSize();
    }, 300);
}

document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("sidebar-close-btn");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            closeSidebar();
        });
    }
});

function handleMovieSelect(event, feature) {
    const selectedName = event.target.value;
    const detailDiv = document.getElementById(`movie-detail-${feature.id}`);

    const lichChieu = feature?.properties?.lich_chieu || [];

    if (selectedName === "" || !feature) {
        detailDiv.innerHTML = "";
    } else {
        const matchingMovies = lichChieu.filter(item => item.ten_phim === selectedName);

        if (matchingMovies.length > 0) {
            // KHÔNG lọc gì hết, hiện toàn bộ matchingMovies
            detailDiv.innerHTML = `
                <div><img src="${matchingMovies[0].anh_phim}" alt="Cinema Image" style="width: 100%; height: auto; display: block;" /></div>
                <b>Phim:</b> ${matchingMovies[0].ten_phim}<br>
                <b>Thể loại:</b> ${matchingMovies[0].the_loai}<br>
                <b>Mô tả:</b> ${matchingMovies[0].mo_ta_phim}<br>
                <b>Các suất chiếu:</b>
                <ul style="margin-top: 5px;">
                    ${matchingMovies.map(m => `<li>${m.gio_chieu}</li>`).join("")}
                </ul>
            `;
        } else {
            detailDiv.innerHTML = "<em>Không có thông tin chi tiết.</em>";
        }
    }
}

const cinemaLookup = {};

var geojsonOpts = {
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

        // Gán feature lại vào marker để có thể sử dụng sau này
        marker.feature = feature;

        marker.on("click", function (e) {
            const feature = e.target.feature;
            const latlng = e.latlng;
            const lichChieu = feature.properties.lich_chieu || [];

            let dropdownHtml = "<em>Chưa có lịch chiếu</em>";
            if (lichChieu.length > 0) {
                const uniqueMovies = [...new Set(lichChieu.map(item => item.ten_phim))];

                dropdownHtml = `
                
                    <label for="movie-select-${feature.id}"><b>Danh sách phim:</b></label><br>
                    <select id="movie-select-${feature.id}">
                        <option value="">-- Chọn phim --</option>
                        ${uniqueMovies.map(name => `<option value="${name}">${name}</option>`).join("")}
                    </select>
                    <div id="movie-detail-${feature.id}" style="margin-top: 10px; font-size: 0.9em;"></div>
                
                `;
            }

            const sidebarContent = `
                <div><img src="${feature.properties.image}" alt="Cinema Image" style="width: 100%; height: auto; display: block;" /></div>
                <h5>${feature.properties.name}</h5>
                <strong>Địa chỉ:</strong> <em style="font-style: normal;">${feature.properties.address}</em><br>
                <strong>Mô tả:</strong> <em style="font-style: normal;">${feature.properties.description || ''}</em><br>
                ${dropdownHtml}
                <br><br>
                <button onclick="window.routeToDestination([${latlng.lat}, ${latlng.lng}])" class="route-button">Chỉ đường</button>
            `;

            openSidebar(sidebarContent);

            const selectEl = document.getElementById(`movie-select-${feature.id}`);
            if (selectEl) {
                selectEl.addEventListener("change", (event) => handleMovieSelect(event, feature));
            }
        });

        return marker;
    },
};

window.geojsonOpts = geojsonOpts;
window.handleMovieSelect = handleMovieSelect;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
setCinemaLookup(cinemaLookup);

console.log("✅ Layer setup (geojsonOpts) done.");
