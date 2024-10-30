from django.shortcuts import render, redirect, get_object_or_404
from .models import TodoItem
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages

 # If you want to require login for the home page
def home(request):
    # return render(request, 'todo_list/home.html', {})
    if request.method == "POST":
            username = request.POST['username']
            password = request.POST['password']
            user = authenticate(request, username = username, password = password)
            if user is not None:
                login(request, user)
                messages.success(request, "Login Successful")
                return redirect('home')
            else:
                messages.success(request, "Login Error")
                return redirect('home')
    else:
        return render(request, 'todo_list/home.html', {})

@login_required
def todo_list_view(request):
    if request.method == 'POST':
        if 'delete' in request.POST:  # Check if the delete button was pressed
            task_id = request.POST.get('task_id')
            task = get_object_or_404(TodoItem, id=task_id, user=request.user) 
            task.delete()  # Delete the task
        else:
            text = request.POST.get('text')
            if text:
                TodoItem.objects.create(text=text, user=request.user)
                return redirect('todo_list_view')

    tasks = TodoItem.objects.filter(user=request.user)
    return render(request, 'todo_list/todo_list.html', {'tasks': tasks})

def login_user(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, "Login Successful")
            return redirect('todo_list_view')
        else:
            messages.error(request, "Invalid username or password")
            return redirect('home')
    return render(request, 'todo_list/login.html')

@login_required
def logout_user(request):
    logout(request)
    messages.success(request, "Logged out successfully")
    return redirect('home')