from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('todo_list.urls')),  # Add this to map the root URL to the todo_list app
]
