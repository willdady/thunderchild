from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse_lazy, reverse
from thunderchild import models
from thunderchild import forms


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def fieldgroups(request):
    fieldgroups = models.FieldGroup.objects.all()
    fields = models.Field.objects.all()
    field_list = []
    for fieldgroup in fieldgroups:
        d = {}
        d['fieldgroup'] = fieldgroup
        d['fields'] = fields.filter(fieldgroup__exact=fieldgroup).order_by('field_display_order')
        field_list.append(d)
    return render(request, 'thunderchild/field_groups.html', {'field_list':field_list})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def create_fieldgroup(request):
    if request.method == 'POST':
        form = models.FieldGroupForm(request.POST)
        if form.is_valid():
            model = models.FieldGroup(**form.cleaned_data)
            model.save()
            return redirect('thunderchild.field_views.fieldgroups')
        else:
            return render(request, 'thunderchild/create_fieldgroup.html', {'form':form})
    else:
        form = models.FieldGroupForm()
        return render(request, 'thunderchild/create_fieldgroup.html', {'form':form})
    
    
@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def edit_fieldgroup(request, fieldgroup_id):
    model = get_object_or_404(models.FieldGroup, pk=fieldgroup_id)
    if request.method == 'POST':
        form = models.FieldGroupForm(request.POST, instance=model)
        if form.is_valid():
            form.save()
            return redirect('thunderchild.field_views.fieldgroups')
        else:
            return render(request, 'thunderchild/edit_fieldgroup.html', {'form':form, 'fieldgroup_id':fieldgroup_id})
    else:
        form = models.FieldGroupForm(instance=model)
        return render(request, 'thunderchild/edit_fieldgroup.html', {'form':form, 'fieldgroup_id':fieldgroup_id})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def delete_fieldgroup(request, fieldgroup_id):
    models.FieldGroup.objects.filter(id=fieldgroup_id).delete()
    return redirect('thunderchild.field_views.fieldgroups')


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def create_field(request, fieldgroup_id):
    if request.method == 'POST':
        form = models.FieldForm(request.POST)
        if form.is_valid():
            model = models.Field(**form.cleaned_data)
            model.save()
            return redirect('thunderchild.field_views.fieldgroups')
        else:
            model = get_object_or_404(models.FieldGroup, pk=fieldgroup_id)
            return render(request, 'thunderchild/create_field.html', {'form':form, 'fieldgroup_id':fieldgroup_id, 'fieldgroup_name':model.fieldgroup_name})
    else:
        form = models.FieldForm(initial={'fieldgroup':fieldgroup_id})
        model = get_object_or_404(models.FieldGroup, pk=fieldgroup_id)
        return render(request, 'thunderchild/create_field.html', {'form':form, 'fieldgroup_id':fieldgroup_id, 'fieldgroup_name':model.fieldgroup_name})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def edit_field(request, fieldgroup_id, field_id):
    model = get_object_or_404(models.Field, pk=field_id)
    if request.method == 'POST':
        form = models.FieldForm(request.POST, instance=model)
        if form.is_valid():
            form.save()
            return redirect('thunderchild.field_views.fieldgroups')
        else:
            return render(request, 'thunderchild/edit_field.html', {'form':form, 'fieldgroup_id':fieldgroup_id, 'field_id':field_id, 'fieldgroup_name':model.fieldgroup.fieldgroup_name})
    else:
        form = models.FieldForm(instance=model)
        delete_url = reverse(delete_field, args=[model.fieldgroup.id, model.id])
        return render(request, 'thunderchild/edit_field.html', {'form':form, 
                                                                'fieldgroup_id':fieldgroup_id, 
                                                                'field_id':field_id, 
                                                                'fieldgroup_name':model.fieldgroup.fieldgroup_name,
                                                                'delete_url':delete_url})
    

@login_required(login_url=reverse_lazy('thunderchild.views.login'))    
def delete_field(request, fieldgroup_id, field_id):
    models.Field.objects.filter(id=field_id).delete()
    models.FieldData.objects.filter(field=field_id).delete()
    return redirect('thunderchild.field_views.fieldgroups')

