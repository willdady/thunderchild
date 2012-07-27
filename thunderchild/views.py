from django.conf import settings
from django.contrib.auth import authenticate, login as do_login, \
    logout as do_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User, Group
from django.contrib.sites.models import Site
from django.core.urlresolvers import reverse_lazy
from django.http import HttpResponseNotFound
from django.shortcuts import render_to_response, render, redirect, \
    get_object_or_404
from thunderchild import forms, models, model_forms
import json


def login(request):
    next = request.GET.get('next')
    if request.method == 'POST':
        form = forms.LoginForm(request.POST)
        if form.is_valid():
            username = request.POST.get('username')
            password = request.POST.get('password')
            remember_me = request.POST.get('remember_me')
            user = authenticate(username=username, password=password)
            if user is not None:
                if not user.is_active: return render(request, 'thunderchild/login.html', {'form':form, 'next':next, 'errors':['Account is inactive']})
                if not user.is_staff: return render(request, 'thunderchild/login.html', {'form':form, 'next':next, 'errors':['Your account is not authorized to access this area']})
                # If remember me is False, set session expiry to 0 so the login will remain active for the current session only.
                if not remember_me:
                    request.session.set_expiry(0)
                do_login(request, user)
                if next:
                    return redirect(next)
                else:
                    return redirect('thunderchild.views.dashboard')
            else:
                return render(request, 'thunderchild/login.html', {'form':form, 'next':next, 'errors':['Invalid login']})
        else:
            return render(request, 'thunderchild/login.html', {'form':form, 'next':next, 'errors':['Invalid login']})
    else:
        form = forms.LoginForm()
        return render(request, 'thunderchild/login.html', {'form':form, 'next':next})


def logout(request):
    do_logout(request)
    return redirect('thunderchild.views.login')


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def dashboard(request):
    return render(request, 'thunderchild/dashboard.html')


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def users(request):
    users = User.objects.all()
    return render(request, 'thunderchild/users.html', {'users':users})

    