from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse_lazy
from django.core.paginator import Paginator, PageNotAnInteger
from django.http import HttpResponse
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
import os.path


def get_non_image_thumbnail_url(filename, type):
    thumb = None
    if type == 'application/pdf':
        thumb = 'pdf'
    elif type == 'audio/mp3':
        thumb = 'mp3'
    elif type == 'audio/wav':
        thumb = 'mp3'
    elif type == 'application/x-zip-compressed':
        thumb = 'zip'
    elif type == 'text/plain':
        thumb = 'txt'
    elif type == 'text/xml':
        thumb = 'txt'
    elif type == 'text/css':
        thumb = 'css'
    # If we found a match based on type we can return
    if thumb:
        return '{}thunderchild/images/media_icons/{}.png'.format(settings.STATIC_URL, thumb)
    # If no match based on type, try match based on file extension.
    ext = filename.split('.')[-1]
    extensions = ['aac', 'ai', 'aiff', 'avi', 
                  'bmp', 
                  'c', 'cpp', 'css', 
                  'dat', 'dmg', 'doc', 'dotx', 'dwg', 'dxf', 
                  'eps', 'exe', 
                  'flv', 
                  'h', 'hpp', 'html', 
                  'ics', 'iso',
                  'java', 
                  'key', 
                  'mid', 'mp3', 'mp4', 'mpg', 
                  'odf', 'ods', 'odt', 'otp', 'ots', 'ott', 
                  'pdf', 'php', 'ppt', 'psd', 'py', 
                  'qt', 
                  'rar', 'rb', 'rtf', 
                  'sql',
                  'tga', 'tgz', 'tiff', 'txt', 
                  'wav', 
                  'xls', 'xlsx', 'xml', 
                  'yml', 
                  'zip']
    if ext in extensions:
        return '{}thunderchild/images/media_icons/{}.png'.format(settings.STATIC_URL, ext)
    # If still no match simply return generic icon
    return '{}thunderchild/images/media_icons/_blank.png'.format(settings.STATIC_URL)


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def media(request):

    media_assets_list = models.MediaAsset.objects.all().order_by('-created')
    paginator = Paginator(media_assets_list, 24) # Create paginator with 24 items per page
    
    page = request.GET.get('page')
    try:
        media_assets = paginator.page(page)
    except PageNotAnInteger:
        media_assets = paginator.page(1)
    
    data = []
    for asset in media_assets:
        a = {}
        a['id'] = asset.id
        a['filename'] = asset.filename
        a['url'] = asset.url
        a['size'] = filesizeformat(asset.size)
        a['is_image'] = asset.is_image
        a['type'] = asset.type
        a['width'] = asset.width
        a['height'] = asset.height
        a['is_image'] = asset.is_image
        if asset.is_image:
            a['thumbnail_url'] = asset.thumbnail_url
        else:
            a['thumbnail_url'] = get_non_image_thumbnail_url(asset.filename, asset.type)
        data.append(a)
    return render(request, 'thunderchild/media.html', {'media_assets_json':json.dumps(data), 'media_assets':media_assets})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def upload(request):
    if request.method == 'POST':
        f = request.FILES.get('file')
        
        resp = {}
        
        today = date.today()
        directory = "{}/{}/".format(today.year, today.month)
        
        fs = FileSystemStorage(location=settings.MEDIA_ROOT+directory, base_url=settings.MEDIA_URL+directory)
        
        filename = fs.get_valid_name(f.name)
        if fs.exists(filename):
            name_conflict = {'original':filename}
            filename = fs.get_available_name(filename)
            name_conflict['new'] = filename
            resp['name_conflict'] = name_conflict
        #Save the file to disk
        disk_path = fs.save(filename, f)
        #Save a thumbnail to disk
        width, height = None, None
        try:
            thumbnail_filename = filename.split('.')[0] + '-thumb.jpg' #Save all thumbnails as jpeg regardless of upload image type.
            im = Image.open(os.path.join(settings.MEDIA_ROOT, directory, filename))
            width, height = im.size
            im.thumbnail((140, 140), Image.ANTIALIAS)
            im.save(os.path.join(settings.MEDIA_ROOT, directory, thumbnail_filename))
        except IOError:
            thumbnail_filename = None
            pass
        #Store reference to the file in our model
        mediaAsset = models.MediaAsset()
        mediaAsset.filename = filename
        mediaAsset.base_url = '{ MEDIA_URL }'
        mediaAsset.size = fs.size(filename)
        mediaAsset.type = f.content_type
        mediaAsset.directory = directory
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
    return render(request, 'thunderchild/media.html', {})
    
    
@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def edit_asset(request, asset_id):    
    if request.method == 'DELETE':
        try:
            model = models.MediaAsset.objects.get(pk=asset_id)
        except models.MediaAsset.DoesNotExist:
            pass
        if model:
            #Delete the file from disk (if it exists)
            try:
                os.remove(model.file_path)
            except:
                pass
            #Delete the thumbnail from disk (if it exists)
            try:
                os.remove(model.thumbnail_path)
            except:
                pass
            #Delete the model
            model.delete()
        return HttpResponse("OK")
    else:
        return HttpResponseNotAllowed(permitted_methods=['DELETE'])
        
        
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


    