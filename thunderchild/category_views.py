from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse_lazy, reverse
from django.http import HttpResponseNotAllowed, HttpResponse,\
    HttpResponseBadRequest
from django.shortcuts import render, redirect, get_object_or_404
from thunderchild import forms, model_forms, models
from django.core import serializers
import json

@login_required(login_url=reverse_lazy('thunderchild.views.login'))    
def categories(request):
#    categorygroups = models.CategoryGroup.objects.all()
#    categories = models.Category.objects.all()
#    category_list = []
#    for categorygroup in categorygroups:
#        d = {}
#        d['categorygroup'] = categorygroup
#        d['categories'] = categories.filter(categorygroup__exact=categorygroup)
#        category_list.append(d)
#    categorygroup_form = model_forms.CategoryGroupForm()
#    category_form = model_forms.CategoryForm()
#    return render(request, 'thunderchild/categories.html', {'category_list':category_list,
#                                                            'categorygroup_form':categorygroup_form,
#                                                            'category_form':category_form})

    categorygroups_json = json.dumps([ model.as_dict() for model in models.CategoryGroup.objects.all()])
    categories_json = json.dumps([ model.as_dict() for model in models.Category.objects.all()])
    categorygroup_form = model_forms.CategoryGroupForm()
    category_form = model_forms.CategoryForm()
    return render(request, 'thunderchild/categories.html', {'categorygroups_json':categorygroups_json,
                                                            'categories_json':categories_json,
                                                            'categorygroup_form':categorygroup_form,
                                                            'category_form':category_form})


@login_required(login_url=reverse_lazy('thunderchild.views.login')) 
def categorygroup_post(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest()
        form = model_forms.CategoryGroupForm(data)
        if form.is_valid():
            form.save()
            model = form.instance
            return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps({'errors':form.errors}), content_type="application/json")
    if request.method == 'GET':
        data = json.dumps([ model.as_dict() for model in models.CategoryGroup.objects.all()])
        return HttpResponse(data, content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])


@login_required(login_url=reverse_lazy('thunderchild.views.login')) 
def categorygroup_put_get_delete(request, id):
    if request.method == 'PUT':
        model = get_object_or_404(models.CategoryGroup, pk=id)
        try:
            data = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest()
        form = model_forms.CategoryGroupForm(data, instance=model)
        if form.is_valid():
            form.save()
            return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps({'errors':form.errors}), content_type="application/json")
    elif request.method == 'DELETE':
        models.CategoryGroup.objects.filter(pk=id).delete()
        return HttpResponse("OK")
    elif request.method == 'GET':
        model = get_object_or_404(models.CategoryGroup, pk=id)
        return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST', 'PUT', 'DELETE'])


#@login_required(login_url=reverse_lazy('thunderchild.views.login'))    
#def create_categorygroup(request):
#    if request.method == 'POST':
#        form = model_forms.CategoryGroupForm(request.POST)
#        if form.is_valid():
#            form.save()
#            return redirect('thunderchild.category_views.categories')
#            #return redirect('thunderchild.category_views.create_category', form.instance.id)
#        else:
#            return render(request, 'thunderchild/create_categorygroup.html', {'form':form})
#    else:
#        form = model_forms.CategoryGroupForm()
#        return render(request, 'thunderchild/create_categorygroup.html', {'form':form})
#
#
#@login_required(login_url=reverse_lazy('thunderchild.views.login'))    
#def edit_categorygroup(request, categorygroup_id):
#    model = get_object_or_404(models.CategoryGroup, pk=categorygroup_id)
#    if request.method == 'POST':
#        form = model_forms.CategoryGroupForm(request.POST, instance=model)
#        if form.is_valid():
#            form.save()
#            return redirect('thunderchild.category_views.categories')
#        else:
#            return render(request, 'thunderchild/edit_categorygroup.html', {'form':form, 
#                                                                            'categorygroup_id':categorygroup_id,
#                                                                            'delete_url':reverse('thunderchild.category_views.delete_categorygroup')})
#    else:
#        form = model_forms.CategoryGroupForm(instance=model)
#        return render(request, 'thunderchild/edit_categorygroup.html', {'form':form, 
#                                                                        'categorygroup_id':categorygroup_id,
#                                                                        'delete_url':reverse('thunderchild.category_views.delete_categorygroup')})
#
#
#@login_required(login_url=reverse_lazy('thunderchild.views.login')) 
#def delete_categorygroup(request):
#    if request.method == 'POST':
#        models.CategoryGroup.objects.filter(id__exact=request.POST['id']).delete()
#        return redirect('thunderchild.category_views.categories') 
#    else:
#        return HttpResponseNotAllowed(permitted_methods=['POST'])


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def category_post(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest()
        form = model_forms.CategoryForm(data)
        if form.is_valid():
            form.save()
            model = form.instance
            return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps({'errors':form.errors}), content_type="application/json")
    if request.method == 'GET':
        data = json.dumps([ model.as_dict() for model in models.Category.objects.all()])
        return HttpResponse(data, content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST', 'GET'])



@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def category_put_get_delete(request, id):
    if request.method == 'PUT':
        model = get_object_or_404(models.Category, pk=id)
        try:
            data = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest()
        form = model_forms.CategoryForm(data, instance=model)
        if form.is_valid():
            form.save()
            return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps({'errors':form.errors}), content_type="application/json")
    elif request.method == 'DELETE':
        models.Category.objects.filter(pk=id).delete()
        return HttpResponse("OK")
    elif request.method == 'GET':
        model = get_object_or_404(models.Category, pk=id)
        return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST', 'PUT', 'DELETE'])


#@login_required(login_url=reverse_lazy('thunderchild.views.login'))   
#def create_category(request, categorygroup_id):
#    if request.method == 'POST':
#        form = model_forms.CategoryForm(request.POST)
#        if form.is_valid():
#            form.save()
#            return redirect('thunderchild.category_views.categories')
#        else:
#            return render(request, 'thunderchild/create_category.html', {'form':form, 'categorygroup_id':categorygroup_id})
#    else:
#        form = model_forms.CategoryForm(initial={'categorygroup':categorygroup_id})
#        return render(request, 'thunderchild/create_category.html', {'form':form, 'categorygroup_id':categorygroup_id})
#
#
#@login_required(login_url=reverse_lazy('thunderchild.views.login'))   
#def edit_category(request, categorygroup_id, category_id):
#    model = get_object_or_404(models.Category, pk=category_id)
#    if request.method == 'POST':
#        form = model_forms.CategoryForm(request.POST, instance=model)
#        if form.is_valid():
#            form.save()
#            return redirect('thunderchild.category_views.categories')
#        else:
#            return render(request, 'thunderchild/edit_category.html', {'form':form, 
#                                                                       'categorygroup_id':categorygroup_id, 
#                                                                       'category_id':category_id,
#                                                                       'delete_url':reverse('thunderchild.category_views.delete_category', args=[categorygroup_id])})
#    else:
#        form = model_forms.CategoryForm(instance=model)
#        return render(request, 'thunderchild/edit_category.html', {'form':form, 
#                                                                   'categorygroup_id':categorygroup_id, 
#                                                                   'category_id':category_id,
#                                                                   'delete_url':reverse('thunderchild.category_views.delete_category', args=[categorygroup_id])})
#
#
#@login_required(login_url=reverse_lazy('thunderchild.views.login'))   
#def delete_category(request, categorygroup_id):
#    if request.method == 'POST':
#        models.Category.objects.filter(id=request.POST['id']).delete()
#        return redirect('thunderchild.category_views.categories')
#    else:
#        return HttpResponseNotAllowed(permitted_methods=['POST'])
        
