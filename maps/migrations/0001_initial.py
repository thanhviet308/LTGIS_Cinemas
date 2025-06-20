# Generated by Django 5.1.6 on 2025-04-16 15:08

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Phim',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ten_phim', models.CharField(max_length=255)),
                ('the_loai', models.CharField(max_length=100)),
                ('thoi_luong', models.PositiveIntegerField(help_text='Thời lượng (phút)')),
                ('mo_ta_phim', models.TextField(blank=True, null=True)),
                ('anh_phim', models.ImageField(blank=True, null=True, upload_to='cinema/')),
            ],
        ),
        migrations.CreateModel(
            name='RapChieuPhim',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ten_rap', models.CharField(max_length=255)),
                ('dia_chi', models.TextField()),
                ('kinh_do', models.FloatField()),
                ('vi_do', models.FloatField()),
                ('mo_ta', models.TextField(blank=True, null=True)),
                ('anh_rap', models.ImageField(blank=True, null=True, upload_to='cinema/')),
            ],
        ),
        migrations.CreateModel(
            name='GioChieu',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('thoi_gian', models.DateTimeField()),
                ('phim', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='gio_chieu', to='maps.phim')),
                ('rap', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='gio_chieu', to='maps.rapchieuphim')),
            ],
        ),
    ]
