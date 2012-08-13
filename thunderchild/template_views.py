from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse_lazy, reverse
from thunderchild import models
from thunderchild import forms
from thunderchild import model_forms
from django.http import HttpResponseNotAllowed, HttpResponse,\
    HttpResponseBadRequest
from django.core import serializers
import json


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def templates(request):
    templategroups = models.TemplateGroup.objects.all().order_by('templategroup_short_name')
    templates = models.Template.objects.all().order_by('template_short_name')
    # Taking the above 2 querysets we loop over them building a list in this format [{'templategroup':TemplateGroup, 'templates':[Template, Template, ...]}, ...]
    # Note the template groups are ordered with the root template group first followed by all other template groups ordered alphabetically. Similarly, templates
    # within template groups have the index template first followed by all other templates ordered alphabetically.
    templates_list = []
    for templategroup in templategroups:
        _templates = []
        for template in templates:
            if template.templategroup == templategroup:
                if template.template_short_name == 'index':
                    _templates.insert(0, template)
                else:
                    _templates.append(template)
        if templategroup.templategroup_short_name == 'root':
            templates_list.insert(0, {'templategroup':templategroup, 'templates':_templates})
        else:
            templates_list.append({'templategroup':templategroup, 'templates':_templates})
    
    return render(request, 'thunderchild/templates.html', {'templates':templates_list,
                                                           'template_form':model_forms.TemplateForm,
                                                           'new_template_form':model_forms.TemplateForm(auto_id="id2_%s"),
                                                           'new_templategroup_form':model_forms.TemplateGroupForm,
                                                           'edit_templategroup_form':model_forms.TemplateGroupForm(auto_id="id2_%s")})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def template_create(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest()
        data['template_content'] = '{% load thunderchild_tags %}' # As we are creating a new template populate the content field with thunderchild's custom template tags.
        form = model_forms.TemplateForm(data)
        if form.is_valid():
            model = form.instance
            model.template_uid = '{}/{}'.format(models.TemplateGroup.objects.get(pk=data['templategroup']).templategroup_short_name, data['template_short_name'])
            model.save()
            return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps({'errors':form.errors}), content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def template(request, id):
    if request.method == 'PUT':
        model = get_object_or_404(models.Template, pk=id)
        try:
            data = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest()
        form = model_forms.TemplateForm(data, instance=model)
        if form.is_valid():
            form.save()
            return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps({'errors':form.errors}), content_type="application/json")
    elif request.method == 'DELETE':
        model = get_object_or_404(models.Template, pk=id)
        if model.template_short_name == 'index':
            return HttpResponseBadRequest(json.dumps({'error':'Deleting index templates is forbidden.'}), content_type="application/json")
        else:
            model.delete()
            return HttpResponse("OK")
    elif request.method == 'GET':
        model = models.Template.objects.filter(pk=id)[0]
        return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST', 'PUT', 'DELETE'])
    

@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def group_create(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest()
        form = model_forms.TemplateGroupForm(data)
        if form.is_valid():
            form.save()
            # We automatically create an index templage within this group
            index = models.Template(templategroup=form.instance, template_short_name='index', template_uid='{}/{}'.format(form.instance.templategroup_short_name, 'index'))
            index.save()
            data = {'templategroup':form.instance.as_dict(), 'template':index.as_dict()}
            return HttpResponse(json.dumps(data), content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps({'errors':form.errors}), content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def group(request, id):
    if request.method == 'PUT':
        model = get_object_or_404(models.TemplateGroup, pk=id)
        try:
            data = json.loads(request.body)
        except ValueError:
            return HttpResponseBadRequest()
        form = model_forms.TemplateGroupForm(data, instance=model)
        if form.is_valid():
            form.save()
            return HttpResponse(json.dumps(model.as_dict()), content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps({'errors':form.errors}), content_type="application/json")
    elif request.method == 'DELETE':
        model = get_object_or_404(models.TemplateGroup, pk=id)
        if model.templategroup_short_name == 'root':
            return HttpResponseBadRequest(json.dumps({'error':'Deleting the root template group is forbidden.'}), content_type="application/json")
        else:
            model.delete()
            return HttpResponse("OK")
    elif request.method == 'GET':
        data = serializers.serialize('json', models.TemplateGroup.objects.filter(pk=id))
        return HttpResponse(data, content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['PUT', 'DELETE', 'GET'])

