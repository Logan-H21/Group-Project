from django.urls import path, include
from .views import todo_list_view, home
from . import views

urlpatterns = [
    path('', home, name='home'),
    path('todo/', todo_list_view, name='todo_list_view'),
    # path('login/', views.login_user, name = 'Login'),
    # path('logout/', views.logout_user, name = 'Logout'),
]
