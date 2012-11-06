from PIL import Image
from datetime import date
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.core.files.storage import FileSystemStorage
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.core.urlresolvers import reverse_lazy
from django.http import HttpResponse, HttpResponseNotFound, \
    HttpResponseNotAllowed
from django.shortcuts import render, redirect, get_object_or_404
from django.template.defaultfilters import filesizeformat
from thunderchild import forms, models
import json
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
        resp['url'] = fs.url(filename)
        resp['size'] = fs.size(filename)
        
        return HttpResponse(json.dumps(resp), content_type="text/json")
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


    