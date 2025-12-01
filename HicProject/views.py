from django.shortcuts import render
from accounts.models import Profile  # FIXED IMPORT

def home(request):
    return render(request, "index.html")
