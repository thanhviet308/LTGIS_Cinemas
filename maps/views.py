from django.shortcuts import render
from .models import RapChieuPhim
from django.http import JsonResponse
from django.conf import settings
from django.http import JsonResponse

# Create your views here.
def simplemap(request):
    return render(request, 'simple-map.html')
def search(request):
    return render(request, 'search-address.html')
def cinema(request):
    return render(request, 'index.html')

def cinema_geojson(request):
    features = []

    for rap in RapChieuPhim.objects.all():
        # Xử lý ảnh rạp
        anh_rap_url = None
        if rap.anh_rap:
            relative_path = str(rap.anh_rap)
            media_url = settings.MEDIA_URL
            if not media_url.endswith('/'):
                media_url += '/'
            anh_rap_url = request.build_absolute_uri(media_url + relative_path)

        # Lấy danh sách giờ chiếu có liên kết với rạp
        gio_chieu_list = rap.gio_chieu.select_related('phim').all()

        # Chuẩn bị danh sách phim với giờ chiếu
        lich_chieu = []
        danh_sach_ten_phim = set()  # 🛑 Tạo set để gom các tên phim

        for gio in gio_chieu_list:
            anh_phim_url = None
            if gio.phim.anh_phim:
                relative_path_phim = str(gio.phim.anh_phim)
                media_url = settings.MEDIA_URL
                if not media_url.endswith('/'):
                    media_url += '/'
                anh_phim_url = request.build_absolute_uri(media_url + relative_path_phim)

            # 🛑 Thêm tên phim vào set
            danh_sach_ten_phim.add(gio.phim.ten_phim)

            lich_chieu.append({
                "ten_phim": gio.phim.ten_phim,
                "the_loai": gio.phim.the_loai,
                "thoi_luong": gio.phim.thoi_luong,
                "gio_chieu": gio.thoi_gian.strftime("%H:%M %d-%m-%Y"),
                "mo_ta_phim": gio.phim.mo_ta_phim,
                "anh_phim": anh_phim_url
            })

        # 🛑 Convert set thành list
        danh_sach_ten_phim = list(danh_sach_ten_phim)

        features.append({
            "type": "Feature",
            "properties": {
                "name": rap.ten_rap,
                "address": rap.dia_chi,
                "description": rap.mo_ta,
                "image": anh_rap_url,
                "lich_chieu": lich_chieu,
                "movies": danh_sach_ten_phim  # 🛑 Thêm danh sách tên phim vào đây
            },
            "geometry": {
                "type": "Point",
                "coordinates": [rap.kinh_do, rap.vi_do]
            }
        })

    data = {
        "type": "FeatureCollection",
        "features": features
    }

    return JsonResponse(data)

