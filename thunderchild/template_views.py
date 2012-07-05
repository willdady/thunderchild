from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse_lazy, reverse
from thunderchild import models
from thunderchild import forms
from thunderchild import model_forms


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
                                                                       'delete_url':reverse('thunderchild.template_views.delete_templategroup', args=[templategroup_id])})
    else:
        form = model_forms.TemplateGroupForm(instance=model)
        return render(request, 'thunderchild/edit_templategroup.html', {'form':form, 
                                                                   'templategroup_id':templategroup_id,
                                                                   'is_root':model.templategroup_short_name == 'root',
                                                                   'delete_url':reverse('thunderchild.template_views.delete_templategroup', args=[templategroup_id])})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def delete_templategroup(request, templategroup_id):
    models.TemplateGroup.objects.filter(id=templategroup_id).delete()
    return redirect('thunderchild.template_views.templates')


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def templates(request):
    templategroups = models.TemplateGroup.objects.all()
    templates = models.Template.objects.all()
    return render(request, 'thunderchild/templates.html', {'templategroups':templategroups, 'templates':templates})


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
        if form.is_valid():
            form.save()
            return redirect('thunderchild.template_views.templates')
        else:
            return render(request, 'thunderchild/edit_template.html', {'form':form, 
                                                                  'templategroup_id':templategroup_id,
                                                                  'templategroup_short_name':model.templategroup.templategroup_short_name, 
                                                                  'template_id':template_id,
                                                                  'is_index':model.template_short_name == 'index',
                                                                  'delete_url':reverse('thunderchild.template_views.delete_template', args=[templategroup_id, template_id])})
    else:
        form = model_forms.TemplateForm(instance=model)
        return render(request, 'thunderchild/edit_template.html', {'form':form, 
                                                              'templategroup_id':templategroup_id,
                                                              'templategroup_short_name':model.templategroup.templategroup_short_name,
                                                              'template_id':template_id,
                                                              'is_index':model.template_short_name == 'index',
                                                              'delete_url':reverse('thunderchild.template_views.delete_template', args=[templategroup_id, template_id])})
    
    
@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def delete_template(request, templategroup_id, template_id):
    models.Template.objects.filter(id=template_id).delete()
    return redirect('thunderchild.template_views.templates')

