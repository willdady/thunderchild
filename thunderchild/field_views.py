from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse_lazy, reverse
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
def create_fieldgroup(request):
    if request.method == 'POST':
        form = model_forms.FieldGroupForm(request.POST)
        if form.is_valid():
            model = models.FieldGroup(**form.cleaned_data)
            model.save()
            return redirect('thunderchild.field_views.fields')
        else:
            return render(request, 'thunderchild/create_fieldgroup.html', {'form':form})
    else:
        form = model_forms.FieldGroupForm()
        return render(request, 'thunderchild/create_fieldgroup.html', {'form':form})
    
    
@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def edit_fieldgroup(request, fieldgroup_id):
    model = get_object_or_404(models.FieldGroup, pk=fieldgroup_id)
    if request.method == 'POST':
        form = model_forms.FieldGroupForm(request.POST, instance=model)
        if form.is_valid():
            form.save()
            return redirect('thunderchild.field_views.fields')
        else:
            return render(request, 'thunderchild/edit_fieldgroup.html', {'form':form, 
                                                                         'fieldgroup_id':fieldgroup_id,
                                                                         'delete_url':reverse(delete_fieldgroup)})
    else:
        form = model_forms.FieldGroupForm(instance=model)
        return render(request, 'thunderchild/edit_fieldgroup.html', {'form':form, 
                                                                     'fieldgroup_id':fieldgroup_id,
                                                                     'delete_url':reverse(delete_fieldgroup)})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def delete_fieldgroup(request):
    if request.method == 'POST':
        models.FieldGroup.objects.filter(id=request.POST['id']).delete()
        return redirect('thunderchild.field_views.fields')
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def create_field(request, fieldgroup_id):
    if request.method == 'POST':
        form = model_forms.FieldForm(request.POST)
        if form.is_valid():
            model = models.Field(**form.cleaned_data)
            model.save()
            return redirect('thunderchild.field_views.fields')
        else:
            model = get_object_or_404(models.FieldGroup, pk=fieldgroup_id)
            return render(request, 'thunderchild/create_field.html', {'form':form, 'fieldgroup_id':fieldgroup_id, 'fieldgroup_name':model.fieldgroup_name})
    else:
        form = model_forms.FieldForm(initial={'fieldgroup':fieldgroup_id})
        model = get_object_or_404(models.FieldGroup, pk=fieldgroup_id)
        return render(request, 'thunderchild/create_field.html', {'form':form, 'fieldgroup_id':fieldgroup_id, 'fieldgroup_name':model.fieldgroup_name})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def edit_field(request, fieldgroup_id, field_id):
    model = get_object_or_404(models.Field, pk=field_id)
    if request.method == 'POST':
        form = model_forms.FieldForm(request.POST, instance=model)
        if form.is_valid():
            form.save()
            return redirect('thunderchild.field_views.fields')
        else:
            return render(request, 'thunderchild/edit_field.html', {'form':form, 
                                                                    'fieldgroup_id':fieldgroup_id, 
                                                                    'field_id':field_id, 
                                                                    'fieldgroup_name':model.fieldgroup.fieldgroup_name,
                                                                    'delete_url':reverse(delete_field, args=[model.fieldgroup.id])})
    else:
        form = model_forms.FieldForm(instance=model)
        return render(request, 'thunderchild/edit_field.html', {'form':form, 
                                                                'fieldgroup_id':fieldgroup_id, 
                                                                'field_id':field_id, 
                                                                'fieldgroup_name':model.fieldgroup.fieldgroup_name,
                                                                'delete_url':reverse(delete_field, args=[model.fieldgroup.id])})
    

@login_required(login_url=reverse_lazy('thunderchild.views.login'))    
def delete_field(request, fieldgroup_id):
    if request.method == 'POST':
        models.Field.objects.filter(id=request.POST['id']).delete()
        models.FieldData.objects.filter(field=request.POST['id']).delete()
        return redirect('thunderchild.field_views.fields')
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])

