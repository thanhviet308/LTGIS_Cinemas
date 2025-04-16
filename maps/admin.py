from django.contrib import admin

# Register your models here.
from .models import RapChieuPhim
from .models import Phim

class RapChieuPhimAdmin(admin.ModelAdmin):
    list_display = ('ten_rap', 'dia_chi', 'mo_ta', 'kinh_do', 'vi_do', 'anh_rap')
    search_fields = ('ten_rap', 'dia_chi')

admin.site.register(RapChieuPhim, RapChieuPhimAdmin)

class PhimAdmin(admin.ModelAdmin):
    list_display = ('ten_phim', 'the_loai', 'thoi_luong', 'mo_ta_phim', 'anh_phim')
    search_fields = ('ten_phim', 'the_loai')

admin.site.register(Phim, PhimAdmin)