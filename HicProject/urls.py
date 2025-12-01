from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from accounts import views as acc_views
from .views import home

urlpatterns = [
    path('admin/', admin.site.urls),

    # Homepage
    path('', home, name='home'),

    # Auth routes
    path('accounts/', include('accounts.urls')),

    # Game routes
    path('game1/', acc_views.game1, name='game1'),
    path('game2/', acc_views.game2, name='game2'),
    path('game3/', acc_views.game3, name='game3'),
    path('game4/', acc_views.game4, name='game4'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
