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
    # Note the TemplateGroup's index template is set to the first item in the templates list. All subsequent templates ordered on 'template_short_name'
    templates_list = []
    for templategroup in templategroups:
        _templates = []
        for template in templates:
            if template.templategroup == templategroup:
                if template.template_short_name == 'index':
                    _templates.insert(0, template)
                else:
                    _templates.append(template)
        templates_list.append({'templategroup':templategroup, 'templates':_templates})
    
    return render(request, 'thunderchild/templates.html', {'templates':templates_list,
                                                           'form':model_forms.TemplateForm,
                                                           'new_template_form':model_forms.TemplateForm(auto_id="id2_%s")})


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
            return HttpResponse(json.dumps(model.asDict()), content_type="application/json")
        else:
            return HttpResponseBadRequest(json.dumps({'errors':form.errors}), content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def template(request, id):
    if request.method == 'PUT':
        pass
    elif request.method == 'DELETE':
        models.Template.objects.filter(pk=id).delete()
        return HttpResponse("OK")
    elif request.method == 'GET':
        model = models.Template.objects.filter(pk=id)[0]
        return HttpResponse(json.dumps(model.asDict()), content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST', 'PUT', 'DELETE'])
    

@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def group_create(request):
    if request.method == 'POST':
        pass
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def group(request, id):
    if request.method == 'PUT':
        pass
    elif request.method == 'DELETE':
        pass
    elif request.method == 'GET':
        data = serializers.serialize('json', models.TemplateGroup.objects.filter(pk=id))
        return HttpResponse(data, content_type="application/json")
    else:
        pass






@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def create_templategroup(request):
    if request.method == 'POST':
        form = model_forms.TemplateGroupForm(request.POST)
        if form.is_valid():
            model = models.TemplateGroup(**form.cleaned_data)
            model.save()
            # We automatically create an index templage within this group
            index = models.Template(templategroup=model, template_short_name='index', template_uid='{}/{}'.format(model.templategroup_short_name, 'index'))
            index.save()
            return redirect('thunderchild.template_views.templates')
        else:
            return render(request, 'thunderchild/create_templategroup.html', {'form':form})
    else:
        form = model_forms.TemplateGroupForm()
        return render(request, 'thunderchild/create_templategroup.html', {'form':form})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def edit_templategroup(request, templategroup_id): 
    model = get_object_or_404(models.TemplateGroup, pk=templategroup_id)
    if request.method == 'POST':
        form = model_forms.TemplateGroupForm(request.POST)
        if form.is_valid():
            model.set_data(form.cleaned_data)
            model.save()
            return redirect('thunderchild.template_views.templates')
        else:
            return render(request, 'thunderchild/edit_templategroup.html', {'form':form, 
                                                                       'templategroup_id':templategroup_id,
                                                                       'is_root':model.templategroup_short_name == 'root',
                                                                       'delete_url':reverse('thunderchild.template_views.delete_templategroup')})
    else:
        form = model_forms.TemplateGroupForm(instance=model)
        return render(request, 'thunderchild/edit_templategroup.html', {'form':form, 
                                                                   'templategroup_id':templategroup_id,
                                                                   'is_root':model.templategroup_short_name == 'root',
                                                                   'delete_url':reverse('thunderchild.template_views.delete_templategroup')})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def delete_templategroup(request):
    if request.method == 'POST':
        models.TemplateGroup.objects.filter(id=request.POST['id']).delete()
        return redirect('thunderchild.template_views.templates')
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def create_template(request, templategroup_id):
    if request.method == 'POST':
        form = model_forms.TemplateForm(request.POST)
        if form.is_valid():
            model = models.Template(**form.cleaned_data)
            model.template_uid = '{}/{}'.format(models.TemplateGroup.objects.get(pk=model.templategroup.id).templategroup_short_name, model.template_short_name)
            model.save()
            return redirect('thunderchild.template_views.templates')
        else:
            return render(request, 'thunderchild/create_template.html', {'form':form, 'templategroup_id':templategroup_id})
    else:
        form = model_forms.TemplateForm(initial={'templategroup':templategroup_id})
        return render(request, 'thunderchild/create_template.html', {'form':form, 'templategroup_id':templategroup_id})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def edit_template(request, templategroup_id, template_id):
    model = get_object_or_404(models.Template, pk=template_id)
    if request.method == 'POST':
        form = model_forms.TemplateForm(request.POST, instance=model)
        print request.POST['submit-button']
        if form.is_valid():
            form.save()
            if request.POST['submit-button'] == 'Save and finnish':
                return redirect('thunderchild.template_views.templates')
        return render(request, 'thunderchild/edit_template.html', {'form':form, 
                                                              'templategroup_id':templategroup_id,
                                                              'templategroup_short_name':model.templategroup.templategroup_short_name, 
                                                              'template_id':template_id,
                                                              'is_index':model.template_short_name == 'index',
                                                              'delete_url':reverse('thunderchild.template_views.delete_template', args=[templategroup_id])})
    else:
        form = model_forms.TemplateForm(instance=model)
        return render(request, 'thunderchild/edit_template.html', {'form':form, 
                                                              'templategroup_id':templategroup_id,
                                                              'templategroup_short_name':model.templategroup.templategroup_short_name,
                                                              'template_id':template_id,
                                                              'is_index':model.template_short_name == 'index',
                                                              'delete_url':reverse('thunderchild.template_views.delete_template', args=[templategroup_id])})
    
    
@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def delete_template(request, templategroup_id):
    if request.method == 'POST':
        models.Template.objects.filter(id=request.POST['id']).delete()
        return redirect('thunderchild.template_views.templates')
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])

