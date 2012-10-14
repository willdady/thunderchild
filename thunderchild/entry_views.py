from datetime import datetime
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse_lazy, reverse
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from thunderchild import models
from thunderchild import model_forms
from django.http import HttpResponseNotAllowed, HttpResponse
import json


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def entrytypes(request):
    entrytypes = models.EntryType.objects.all()
    return render(request, 'thunderchild/entrytypes.html', {'entrytypes':entrytypes})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def create_entrytype(request):
    if request.method == 'POST':
        form = model_forms.EntryTypeForm(request.POST)
        if form.is_valid():
            model = models.EntryType(**form.cleaned_data)
            model.save()
            return redirect('thunderchild.entry_views.entrytypes')
        else:
            return render(request, 'thunderchild/create_entrytype.html', {'form':form})
    else:
        form = model_forms.EntryTypeForm()
        return render(request, 'thunderchild/create_entrytype.html', {'form':form})
    
    
@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def edit_entrytype(request, entrytype_id):
    model = get_object_or_404(models.EntryType, pk=entrytype_id)
    if request.method == 'POST':
        form = model_forms.EntryTypeForm(request.POST, instance=model)
        if form.is_valid():
            form.save()
            return redirect('thunderchild.entry_views.entrytypes')
        else:
            return render(request, 'thunderchild/edit_entrytype.html', {'form':form, 
                                                                   'entrytype_id':entrytype_id,
                                                                   'delete_url':reverse('thunderchild.entry_views.delete_entrytype')})
    else:
        form = model_forms.EntryTypeForm(instance=model)
        return render(request, 'thunderchild/edit_entrytype.html', {'form':form, 
                                                               'entrytype_id':entrytype_id,
                                                               'delete_url':reverse('thunderchild.entry_views.delete_entrytype')})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def delete_entrytype(request):
    if request.method == 'POST':
        models.EntryType.objects.filter(pk=request.POST['id']).delete()
        return redirect('thunderchild.entry_views.entrytypes')
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def entries(request):
    entry_objects = models.Entry.objects.all().order_by('-creation_date')
    
    # Filter entires by entrytype if entrytype parameter is set
    entrytype_id = request.GET.get('entrytype')
    if entrytype_id:
        entry_objects = entry_objects.filter(entrytype__exact=entrytype_id)
    # Filter entires by author if author parameter is set    
    author_id = request.GET.get('author')
    if author_id:
        entry_objects = entry_objects.filter(author__exact=author_id)
    # Filter entires by is_published if author parameter is set    
    is_published = request.GET.get('is_published')
    if is_published:
        entry_objects = entry_objects.filter(is_published__exact=is_published=='True')
    # If both entrytype and author URL parameters are present but equal to empty strings we redirect to the same URL without the parameters.    
    if entrytype_id == '' and author_id == '' and is_published == '':
        return redirect('thunderchild.entry_views.entries')
    
    paginator = Paginator(entry_objects, 15)
    
    page = request.GET.get('page')
    try:
        p = paginator.page(page)
    except PageNotAnInteger:
        p = paginator.page(1)
    except EmptyPage:
        p = paginator.page(paginator.num_pages)
    
    entries = []
    for entry in p:
        entries.append(entry.dict)
    entry_types = models.EntryType.objects.all()
    
    # Rebuild the query string WITHOUT the page parameter (if it exists). We use this to append to our pagination links so filters retain across pages.
    filter_query = '&'.join( ['{}={}'.format(key, val) for key, val in request.GET.items() if key != 'page'] )
    if filter_query != '':
        filter_query = '&'+filter_query
    
    form = model_forms.EntriesFilterForm(request.GET)
    
    return render(request, 'thunderchild/entries.html', {'page':p, 
                                                         'entries':entries, 
                                                         'entry_types':entry_types, 
                                                         'form':form,
                                                         'filter_query':filter_query,
                                                         'delete_url':reverse('thunderchild.entry_views.delete_entry')})
    

@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def create_entry(request, entrytype_id):
    entrytype_model = get_object_or_404(models.EntryType, pk=entrytype_id)
    if request.method == 'POST':
        form1 = model_forms.EntryForm(entrytype_model=entrytype_model, data=request.POST)
        form2 = entrytype_model.get_form(request.POST)
        # As it's possible form2 == None we must check it' existence. If it's not valid there's no point validating form1.
        if form2:
            if not form2.is_valid():
                return render(request, 'thunderchild/create_entry.html', {'form1':form1, 
                                                                          'form2':form2, 
                                                                          'entrytype_id':entrytype_id, 
                                                                          'entrytype_name':entrytype_model.entrytype_name,
                                                                          'has_categorygroup':entrytype_model.categorygroup,
                                                                          'filter_query':filter_query})
        
        if form1.is_valid():
            form1.instance.author = request.user
            form1.save()
            entry = form1.instance
            if form2:
                #Save each custom field into a FieldData object
                fields = models.Field.objects.filter(fieldgroup__exact=entrytype_model.fieldgroup)
                for field in fields:
                    value = form2.cleaned_data[field.field_short_name]
                    field_data = models.FieldData(field=field, entry=entry, value=value)
                    field_data.save()
            return redirect('thunderchild.entry_views.entries')
        else:
            return render(request, 'thunderchild/create_entry.html', {'form1':form1, 
                                                                      'form2':form2, 
                                                                      'entrytype_id':entrytype_id, 
                                                                      'entrytype_name':entrytype_model.entrytype_name,
                                                                      'has_categorygroup':entrytype_model.categorygroup})
    else:
        creation_date_value = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        form1 = model_forms.EntryForm(entrytype_model=entrytype_model, initial={'entrytype':entrytype_id, 'creation_date':creation_date_value})
        form2 = entrytype_model.get_form()
        return render(request, 'thunderchild/create_entry.html', {'form1':form1, 
                                                                  'form2':form2, 
                                                                  'entrytype_id':entrytype_id, 
                                                                  'entrytype_name':entrytype_model.entrytype_name,
                                                                  'has_categorygroup':entrytype_model.categorygroup})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def edit_entry(request, entry_id):
    entry_model = get_object_or_404(models.Entry, pk=entry_id)
    entrytype_model = entry_model.entrytype
    if request.method == 'POST':
        form1 = model_forms.EntryForm(entrytype_model=entrytype_model, data=request.POST, instance=entry_model)
        form2 = entrytype_model.get_form(request.POST)
        # As it's possible form2 == None we must check it' existence. If it's not valid there's no point validating form1.
        if form2:
            if not form2.is_valid():
                return render(request, 'thunderchild/edit_entry.html', {'form1':form1, 
                                                                    'form2':form2, 
                                                                    'entry_id':entry_id, 
                                                                    'entrytype_name':entrytype_model.entrytype_name,
                                                                    'has_categorygroup':entrytype_model.categorygroup,
                                                                    'delete_url':reverse('thunderchild.entry_views.delete_entry')})
                
        if form1.is_valid():
            form1.instance.author = request.user
            form1.save()
            # Get the Fields and FieldData models associated with this Entry.
            fields = models.Field.objects.only('field_short_name').filter(fieldgroup__exact=entrytype_model.fieldgroup)
            fielddatas = models.FieldData.objects.filter(entry__exact=entry_model)
            for field in fields:
                # Try get the FieldData model tied to the current Field. If it doesn't exist create it.
                try:
                    fielddata = fielddatas.get(field__exact=field)
                except models.FieldData.DoesNotExist:
                    value = form2.cleaned_data[field.field_short_name]
                    field_data = models.FieldData(field=field, entry=entry_model, value=value)
                    field_data.save()
                    continue
                # If we have a FieldData for the current Field update it only if it contains data different to what was submitted.
                if fielddata.value != form2.cleaned_data[field.field_short_name]:
                    fielddata.value = form2.cleaned_data[field.field_short_name]
                    fielddata.save()
            
            if request.POST['submit-button'] == 'Save and finish':
                return redirect('thunderchild.entry_views.entries')
            
            data = entry_model.dict
            media_assets = {}
            for key, value in data.items():
                if type(value) == models.MediaAsset:
                    media_assets[key] = value
                    data[key] = value.id # As MediaAsset.__unicode__() returns the asset's url we need to overwrite to point to the MediaAsset's id, not the actual MediaAsset instance.
            return render(request, 'thunderchild/edit_entry.html', {'form1':form1, 
                                                                    'form2':form2, 
                                                                    'entry_id':entry_id, 
                                                                    'entrytype_name':entrytype_model.entrytype_name,
                                                                    'media_assets':media_assets,
                                                                    'has_categorygroup':entrytype_model.categorygroup,
                                                                    'delete_url':reverse('thunderchild.entry_views.delete_entry')})
    else:
        data = entry_model.dict
        media_assets = {}
        for key, value in data.items():
            if type(value) == models.MediaAsset:
                media_assets[key] = value
                data[key] = value.id # As MediaAsset.__unicode__() returns the asset's url we need to overwrite to point to the MediaAsset's id, not the actual MediaAsset instance.
                
        form1 = model_forms.EntryForm(entrytype_model=entrytype_model, initial=data)
        form2 = entrytype_model.get_form(initial=data)
        return render(request, 'thunderchild/edit_entry.html', {'form1':form1, 
                                                                'form2':form2, 
                                                                'entry_id':entry_id, 
                                                                'entrytype_name':entrytype_model.entrytype_name,
                                                                'media_assets':media_assets,
                                                                'has_categorygroup':entrytype_model.categorygroup,
                                                                'delete_url':reverse('thunderchild.entry_views.delete_entry')})
    
    
@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def delete_entry(request):
    if request.method == 'POST':
        models.Entry.objects.filter(pk=request.POST['id']).delete()
        return redirect('thunderchild.entry_views.entries')
    elif request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            id_list = [entry['id'] for entry in data]
            models.Entry.objects.filter(id__in=id_list).delete()
        except ValueError:
            return HttpResponseBadRequest()
        return HttpResponse(json.dumps(data), content_type="application/json")
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST', 'DELETE'])
    
    