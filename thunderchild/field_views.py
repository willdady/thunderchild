from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse_lazy, reverse
from django.http import HttpResponse, HttpResponseBadRequest, \
    HttpResponseNotAllowed
from django.shortcuts import render, redirect, get_object_or_404
from thunderchild import forms, model_forms, models
import json


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def fields(request):    
    return render(request, 'thunderchild/fields.html', {'fieldgroups_json' : json.dumps([model.as_dict() for model in models.FieldGroup.objects.all()]),
                                                        'fields_json' : json.dumps([model.as_dict() for model in models.Field.objects.all()]),
                                                        'fieldgroup_form' : model_forms.FieldGroupForm(),
                                                        'field_form' : model_forms.FieldForm()})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def fieldgroups_post(request):    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest()
        form = model_forms.FieldGroupForm(data)
        if form.is_valid():
            form.save()
            model = form.instance
            return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps({'errors':form.errors}), content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])
    
    
@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def fieldgroups_put_get_delete(request, id): 
    if request.method == 'PUT':
        model = get_object_or_404(models.FieldGroup, pk=id)
        try:
            data = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest()
        form = model_forms.FieldGroupForm(data, instance=model)
        if form.is_valid():
            form.save()
            return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps({'errors':form.errors}), content_type="application/json")
    elif request.method == 'DELETE':
        models.FieldGroup.objects.filter(pk=id).delete()
        return HttpResponse("OK")
    elif request.method == 'GET':
        model = get_object_or_404(models.FieldGroup, pk=id)
        return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST', 'PUT', 'DELETE'])
    
    
@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def field_post(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest()
        form = model_forms.FieldForm(data)
        if form.is_valid():
            form.save()
            model = form.instance
            return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps({'errors':form.errors}), content_type="application/json")
    if request.method == 'GET':
        data = json.dumps([ model.as_dict() for model in models.Field.objects.all()])
        return HttpResponse(data, content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST', 'GET'])


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def field_put_get_delete(request, id):
    if request.method == 'PUT':
        model = get_object_or_404(models.Field, pk=id)
        try:
            data = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest()
        form = model_forms.FieldForm(data, instance=model)
        if form.is_valid():
            form.save()
            model = form.instance
            return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps({'errors':form.errors}), content_type="application/json")
    elif request.method == 'DELETE':
        models.Field.objects.filter(pk=id).delete()
        return HttpResponse("OK")
    elif request.method == 'GET':
        model = get_object_or_404(models.Field, pk=id)
        return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST', 'PUT', 'DELETE'])




