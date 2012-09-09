from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse_lazy
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.http import HttpResponse, HttpResponseNotFound
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.core import serializers
from django.http import HttpResponseNotAllowed
from django.template.defaultfilters import filesizeformat
from thunderchild import models
from thunderchild import forms
import json
from PIL import Image
from datetime import date
import os


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def media(request):
    if request.method == 'POST':
        media_assets = request.POST.getlist('media_asset')
        if media_assets:
            assets = models.MediaAsset.objects.filter(id__in=media_assets)
            for model in assets:
                model.delete_from_disk()
                model.delete()
        return redirect(request.get_full_path())
    else:
        media_assets_list = models.MediaAsset.objects.all().order_by('-created')
        paginator = Paginator(media_assets_list, 24) # Create paginator with 24 items per page
        page = request.GET.get('page')
        try:
            media_assets = paginator.page(page)
        except PageNotAnInteger:
            media_assets = paginator.page(1)
        except EmptyPage:
            url = '{}?page={}'.format(request.path, paginator.num_pages)
            return redirect(url)
        return render(request, 'thunderchild/media.html', {'media_assets':media_assets,
                                                           'delete_url':request.get_full_path()})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def upload(request):
    if request.method == 'POST':
        f = request.FILES.get('file')
        
        resp = {}
        
        fs = FileSystemStorage(location=settings.MEDIA_ROOT, base_url=settings.MEDIA_URL)
        
        filename = fs.get_valid_name(f.name)
        if fs.exists(filename):
            qs = models.MediaAsset.objects.filter(filename__exact=filename)
            if len(qs) > 0:
                existing_asset = qs[0]
                name_conflict = {'original':filename, 'id':existing_asset.id}
                filename = fs.get_available_name(filename)
                resp['name_conflict'] = name_conflict
        #Save the file to disk
        disk_path = fs.save(filename, f)
        #Save a thumbnail to disk
        width, height = None, None
        try:
            # Thumbnails are saved as JPG unless the source is PNG. Then it's saved as a PNG to preserve transparency.
            suffix = '-thumb.jpg'
            if f.content_type == 'image/png':
                suffix = '-thumb.png'
            if f.content_type == 'image/gif':
                suffix = '-thumb.gif'
            thumbnail_filename = filename.split('.')[0] + suffix
            im = Image.open(os.path.join(settings.MEDIA_ROOT, filename))
            width, height = im.size
            im.thumbnail((140, 140), Image.ANTIALIAS)
            im.save(os.path.join(settings.MEDIA_ROOT, thumbnail_filename))
        except IOError:
            thumbnail_filename = None
            pass
        #Store reference to the file in our model
        mediaAsset = models.MediaAsset()
        mediaAsset.filename = filename
        mediaAsset.base_url = '{ MEDIA_URL }'
        mediaAsset.size = fs.size(filename)
        mediaAsset.type = f.content_type
        if thumbnail_filename:
            mediaAsset.thumbnail = thumbnail_filename
            resp['thumbnail_url'] = fs.url(thumbnail_filename)
        if width and height:
            mediaAsset.width = width
            mediaAsset.height = height
            resp['width'] = width
            resp['height'] = height
        mediaAsset.save()
        
        resp['filename'] = filename
        resp['id'] = mediaAsset.id
        resp['result'] = 'success'
        resp['url'] = fs.url(filename)
        resp['size'] = fs.size(filename)
        
        return HttpResponse(json.dumps(resp), content_type="text/json")
    return HttpResponseNotAllowed(permitted_methods=['POST'])
  
  
@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def replace(request):
    if request.method == 'POST':
        existing_asset_id = request.POST.get('existing_asset_id')
        new_asset_id = request.POST.get('new_asset_id')
        
        existing_asset = models.MediaAsset.objects.get(pk=existing_asset_id)
        new_asset = models.MediaAsset.objects.get(pk=new_asset_id)
        
        existing_asset.delete_from_disk()
        
        os.rename(new_asset.file_path, existing_asset.file_path)
        if new_asset.is_image and existing_asset.is_image:
            os.rename(new_asset.thumbnail_path, existing_asset.thumbnail_path)
        elif new_asset.is_image:
            existing_asset.thumbnail = new_asset.thumbnail
        else:
            existing_asset.thumbnail = ''
        
        existing_asset.base_url = new_asset.base_url
        existing_asset.type = new_asset.type
        existing_asset.width = new_asset.width
        existing_asset.height = new_asset.height
        existing_asset.size = new_asset.size
        existing_asset.created = new_asset.created
        
        existing_asset.save()
        new_asset.delete()
        
        resp = {'response':'OK'}
        
        return HttpResponse(json.dumps(resp), content_type="text/json")
        
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def assets(request):
    data = serializers.serialize("json", models.MediaAsset.objects.all())
    return HttpResponse(data, content_type="text/json")

        
@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def media_chooser(request): 
    media_assets_list = models.MediaAsset.objects.all().order_by('-created')
    paginator = Paginator(media_assets_list, 18) # Create paginator with 18 items per page
    
    page = request.GET.get('page')
    try:
        media_assets = paginator.page(page)
    except PageNotAnInteger:
        media_assets = paginator.page(1)
    
    return render(request, 'thunderchild/media_chooser.html', {'media_assets':media_assets})


    