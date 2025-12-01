from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib import messages, auth
from django.contrib.auth.decorators import login_required
from .models import Profile

# ========== PROFILE PAGE ==========
@login_required
def profile(request):
    # Create user profile if not exist
    profile, created = Profile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        if request.FILES.get('profile_image'):
            profile.profile_image = request.FILES['profile_image']
            profile.save()
            messages.success(request, "Profile picture updated!")

    return render(request, 'profile.html', {'profile': profile})


# ========== REGISTER ==========
def register(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists!")
            return redirect("register")

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already registered!")
            return redirect("register")

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # Create an empty profile automatically
        Profile.objects.create(user=user)

        messages.success(request, "Account created successfully! Please log in.")
        return redirect("login")

    return render(request, "register.html")


# ========== LOGIN ==========
def login_user(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = auth.authenticate(username=username, password=password)

        if user is not None:
            auth.login(request, user)
            return redirect("profile")
        else:
            messages.error(request, "Invalid username or password")
            return redirect("login")

    return render(request, "login.html")


# ========== LOGOUT ==========
def logout_user(request):
    auth.logout(request)
    return redirect("login")
# ========== GAME PAGES ==========

def game1(request):
    return render(request, "game1.html")

def game2(request):
    return render(request, "game2.html")

def game3(request):
    return render(request, "game3.html")

def game4(request):
    return render(request, "game4.html")
