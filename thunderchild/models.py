from datetime import datetime
from django import forms
from django.conf import settings
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.db import models
from django.forms.models import ModelForm
from django.forms.widgets import Select, HiddenInput, RadioSelect, TextInput, \
    Textarea
from django.utils.timezone import utc
from thunderchild.validators import validate_lowercase, validate_urlchars, validate_alphanumeric
import json
import os
import thunderchild.forms
from django.contrib.sites.models import Site



class EntryType(models.Model):
    fieldgroup = models.ForeignKey('FieldGroup', blank=True, null=True, on_delete=models.SET_NULL)
    categorygroup = models.ForeignKey('CategoryGroup', blank=True, null=True, on_delete=models.SET_NULL)
    entrytype_name = models.CharField(max_length=80, unique=True, verbose_name='Name')
    entrytype_short_name = models.CharField(max_length=80, unique=True, verbose_name='Short name', db_index=True, validators=[validate_alphanumeric])
    
    def get_form(self, *args, **kwargs):
        if not self.fieldgroup:
            return None
        fields = Field.objects.filter(fieldgroup__exact=self.fieldgroup.id).order_by('field_display_order', 'field_name')
        form = thunderchild.forms.DynamicForm(fields, *args, **kwargs)
        return form
    
    
class Entry(models.Model):
    entrytype = models.ForeignKey(EntryType)
    author = models.ForeignKey(User)
    title = models.CharField(max_length=300, verbose_name='Title')
    slug = models.SlugField(max_length=255, unique=True, verbose_name='Slug')
    creation_date = models.DateTimeField(verbose_name='Created')
    last_modified_date = models.DateTimeField(auto_now=True, verbose_name='Last modified')
    expiration_date = models.DateTimeField(verbose_name='Expires', blank=True, null=True, help_text='A future date for when this entry should expire. Expired entries will not render to templates. Leave blank to never expire.')
    is_published = models.BooleanField(default=True, verbose_name='Published?', choices=((False, 'No'),(True, 'Yes')))
    categories = models.ManyToManyField('Category', blank=True)
    comments_enabled = models.BooleanField(default=False, verbose_name='Enable comments?', choices=((False, 'No'),(True, 'Yes')))
    comments_expiration_date = models.DateTimeField(verbose_name='Disallow comments after:', blank=True, null=True, help_text='A date from when new comments will no longer be accepted. Leave blank to allow comments indefinitely.')

    def get_comment_form(self, *args, **kwargs):
        return thunderchild.forms.CommentForm(initial={'entry_id':self.id}, *args)

    @property
    def comment_form_dict(self):
        try :
            self._comment_form_dict
        except AttributeError:
            self._comment_form_dict = {'form':self.get_comment_form(),
                                        'action':reverse('thunderchild.comment_views.submit'),
                                        'method':'post'}
        return self._comment_form_dict

    def _get_dict(self):
        """ Returns a dictionary representation of this entry INCLUDING it's associated field data."""
        d = {}
        d['entrytype'] = self.entrytype
        d['id'] = self.id
        d['author'] = self.author
        d['title'] = self.title
        d['slug'] = self.slug
        d['creation_date'] = self.creation_date
        d['last_modified_date'] = self.last_modified_date
        d['expiration_date'] = self.expiration_date
        d['is_published'] = self.is_published
        d['categories'] = self.categories.all()
        d['comments_enabled'] = self.comments_enabled
        d['comments_expiration_date'] = self.comments_expiration_date
        if self.comments_enabled:
            d['comments'] = Comment.objects.filter(entry__exact=self.id, is_spam__exact=False, is_approved__exact=True)
            d['comment_form'] = self.comment_form_dict
        
        fielddatas = FieldData.objects.filter(entry__exact=self).filter(field__fieldgroup__exact=self.entrytype.fieldgroup).select_related('field')
        for fielddata in fielddatas:
            d['{}'.format(fielddata.field.field_short_name)] = fielddata.value
        return d
    
    dict = property(_get_dict)
    

class FieldGroup(models.Model):
    '''
    A FieldGroup is a collection of Field models. Strictly speaking a FieldGroup acts as a namespace Fields can be associated with.
    '''
    fieldgroup_name = models.CharField(max_length=100, unique=True)
    
    def __unicode__(self):
        return u'{}'.format(self.fieldgroup_name)


class Field(models.Model):
    '''
    A Field stores information and attributes about a field, it does not store the field's entered data. It can be thought of as the meta-data for the field such
    as whether it is a required field, the order it should be displayed in relation to other fields etc...
    A Field is associated with a single parent FieldGroup.
    '''
    fieldgroup = models.ForeignKey('FieldGroup')
    field_type = models.CharField(max_length=20, verbose_name='Type')
    field_name = models.CharField(max_length=80, verbose_name='Name')
    field_short_name = models.CharField(max_length=80, unique=True, verbose_name='Short name', db_index=True, validators=[validate_alphanumeric,])
    field_instructions = models.CharField(max_length=500, blank=True, verbose_name='Instructions', help_text='Useful instructions on using this field.')
    field_is_required = models.BooleanField(default=True, choices=((False, 'No'),(True, 'Yes')))
    field_display_order = models.IntegerField(default=0, verbose_name='Display order', help_text='The display order of this field in relation to other fields in this group.')
    field_collapsed_by_default = models.BooleanField(default=False, choices=((False, 'No'),(True, 'Yes')), verbose_name='Collapsed by default', help_text='A collapsed field will show only the field name by default and requires a click to expand. Useful for non-required fields.')
    field_options = models.CharField(max_length=1000)
    
    def __unicode__(self):
        return u'{}'.format(self.field_name)
    
    
class FieldData(models.Model):
    '''
    FieldData stores the data belonging to a Field. FieldData is associated with both it's Field and the Entry which the data ultimately belongs to.
    '''
    field = models.ForeignKey('Field')
    entry = models.ForeignKey('Entry')
    media_asset = models.ForeignKey('MediaAsset', blank=True, null=True, on_delete=models.SET_NULL)
    fielddata_value = models.TextField() #Use the instance variable 'value' to read/write to this.
    
    def __init__(self, *args, **kwargs):
        super(FieldData, self).__init__(*args, **kwargs)
        if 'value' in kwargs:
            self.value = kwargs['value']
    
    def _get_value(self):
        '''
        Returns the value of fielddata_value coerced from a string back into a native Python type.
        '''
        if self.field.field_type == 'datetime':
            if settings.USE_TZ:
                return datetime.strptime(self.fielddata_value, '%Y-%m-%d %H:%M:%S').replace(tzinfo=utc) # Convert from string to tz aware datetime
            else:
                return datetime.strptime(self.fielddata_value, '%Y-%m-%d %H:%M:%S') # Convert from string to naive datetime
        if self.field.field_type == 'checkboxes':
            return json.loads(self.fielddata_value)
        if self.field.field_type == 'file':
            return self.media_asset
        return self.fielddata_value
    
    def _set_value(self, value):
        '''
        Takes a native Python type and coerces it into a string for storage in the database.
        '''
        if isinstance(value, datetime):
            if settings.USE_TZ:
                value = value.astimezone(utc).strftime('%Y-%m-%d %H:%M:%S') # Change the datetime's timezone to utc and convert to string
            else:
                value = value.strftime('%Y-%m-%d %H:%M:%S') # Change the datetime string
        elif self.field.field_type == 'checkboxes':
            value = json.dumps(value)
        elif self.field.field_type == 'file':
            self.media_asset = MediaAsset.objects.get(id=value)
            value = 'MEDIA_ASSET'
        self.fielddata_value = value
    
    value = property(_get_value, _set_value)
    
    
class Comment(models.Model):
    entry = models.ForeignKey('Entry')
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    website = models.URLField(blank=True)
    body = models.TextField(max_length=500)
    date = models.DateTimeField(auto_now_add=True)
    ip_address = models.IPAddressField()
    is_approved = models.BooleanField(default=False)
    is_spam = models.BooleanField(default=False)
    
    
class TemplateGroup(models.Model):
    templategroup_short_name = models.CharField(max_length=125, unique=True, verbose_name='Name', validators=[validate_lowercase, validate_urlchars], error_messages={'unique':'A template group already exists with that name'})
    
    def __unicode__(self):
        return u'{}'.format(self.templategroup_short_name)
    
    
class Template(models.Model):
    templategroup = models.ForeignKey('TemplateGroup')
    template_short_name = models.CharField(max_length=125, verbose_name='Name', validators=[validate_lowercase, validate_urlchars], help_text="A URL friendly name containing only letters, numbers and/or the special characters -, _, $, ., +.")
    template_uid = models.CharField(max_length=255, unique=True)
    template_content_type = models.CharField(max_length=50, default='text/html', verbose_name='Content type')
    template_cache_timeout = models.IntegerField(default=0, verbose_name='Cache timeout', help_text='Number of seconds the rendered template should be cached for before being re-rendered. Recommended for templates that do not change often.')
    template_is_private = models.BooleanField(default=False, choices=((False, 'No'),(True, 'Yes')), verbose_name='Is private?', help_text="Private templates are not publicly accessible. They're intended for use as base templates to extend from or as fragments for including in other templates.")
    template_content = models.TextField(default='{% load thunderchild_tags %}', verbose_name='Content')
               
    def __unicode__(self):
        return u'{}/{}'.format(self.templategroup.templategroup_short_name, self.template_short_name)
               
               
class CategoryGroup(models.Model):
    categorygroup_name = models.CharField(max_length=255, verbose_name='Name')
    categorygroup_short_name = models.CharField(max_length=255, unique=True, verbose_name='Short name', db_index=True, validators=[validate_alphanumeric])
    
    def __unicode__(self):
        return u'{}'.format(self.categorygroup_name)
               
               
class Category(models.Model):
    categorygroup = models.ForeignKey(CategoryGroup)
    category_name = models.CharField(max_length=255, verbose_name='Name')
    category_short_name = models.CharField(max_length=255, verbose_name='Short name', db_index=True, validators=[validate_alphanumeric])

    def __unicode__(self):
        return u'{}'.format(self.category_name)


class MediaAsset(models.Model):
    filename = models.CharField(max_length=255, verbose_name='File Name')
    directory = models.CharField(max_length=255, verbose_name='Directory')
    base_url = models.CharField(max_length=255, verbose_name='URL')
    type = models.CharField(max_length=255, verbose_name='Type')
    width = models.IntegerField(blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)
    size = models.IntegerField()
    thumbnail = models.CharField(max_length=255, blank=True, verbose_name='Thumbnail')
    created = models.DateTimeField(auto_now_add=True, verbose_name='Created')
    
    def _get_non_image_thumbnail_url(self, filename, type):
        ext = None
        common_types = [('application/pdf', 'pdf'), ('audio/mp3', 'mp3'), ('audio/wav', 'wav'), ('application/x-zip-compressed', 'zip'), ('text/plain', 'txt'), ('text/xml', 'xml'), ('text/css', 'css')]
        for t in common_types:
            if t[0] == type:
                ext = t[1]
        # If we found a match based on type we can return
        if ext:
            return '{}thunderchild/images/media_icons/{}.png'.format(settings.STATIC_URL, ext)
        # If no match based on type, try match based on file extension.
        ext = filename.split('.')[-1]
        extensions = ['aac', 'ai', 'aiff', 'avi', 'bmp', 'c', 'cpp', 'css', 'dat', 'dmg', 'doc', 'dotx', 'dwg', 'dxf', 'eps', 'exe', 
                      'flv', 'h', 'hpp', 'html', 'ics', 'iso', 'java', 'key', 'mid', 'mp3', 'mp4', 'mpg', 'odf', 'ods', 'odt', 'otp', 
                      'ots', 'ott', 'pdf', 'php', 'ppt', 'psd', 'py', 'qt', 'rar', 'rb', 'rtf', 'sql', 'tga', 'tgz', 'tiff', 'txt', 
                      'wav', 'xls', 'xlsx', 'xml', 'yml', 'zip']
        if ext in extensions:
            return '{}thunderchild/images/media_icons/{}.png'.format(settings.STATIC_URL, ext)
        # If still no match simply return generic icon
        return '{}thunderchild/images/media_icons/_blank.png'.format(settings.STATIC_URL)
    
    @property
    def url(self):
        url = self.base_url + self.directory + self.filename
        return url.replace('{ MEDIA_URL }', settings.MEDIA_URL)
    
    @property
    def thumbnail_url(self):
        if self.is_image:
            url = self.base_url + self.directory + self.thumbnail
            return url.replace('{ MEDIA_URL }', settings.MEDIA_URL)
        else:
            return self._get_non_image_thumbnail_url(self.filename, self.type)
    
    @property
    def file_path(self):
        return os.path.join(settings.MEDIA_ROOT, self.directory, self.filename)
    
    @property
    def thumbnail_path(self):
        return os.path.join(settings.MEDIA_ROOT, self.directory, self.thumbnail)
    
    @property
    def is_image(self):
        return self.type == 'image/jpeg' or self.type == 'image/png' or self.type == 'image/gif'
    
    def delete_from_disk(self):
        '''
        Convienience method for deleting this asset's associated file from disk. NOTE: This makes no changes to the model.
        '''
        if os.path.exists(self.file_path):
            os.remove(self.file_path)
        if os.path.exists(self.thumbnail_path):
            if os.path.isfile(self.thumbnail_path):
                os.remove(self.thumbnail_path)

    def __unicode__(self):
        return u'{}'.format(self.id)
    
    
class ContactForm(models.Model):
    contactform_name = models.CharField(max_length=255, unique=True, verbose_name='Name')
    contactform_short_name = models.CharField(max_length=255, unique=True, verbose_name='Short name', db_index=True, validators=[validate_alphanumeric])
    recipient_emails = models.CharField(max_length=1000, help_text="A comma separated list of recipient email addresses which will receive data submitted via this form.", verbose_name='Recipients')
    success_url = models.CharField(max_length=1000, verbose_name='Success URL', help_text="A URL to redirect the user to once they have successfully submitted the form. eg. /contact/success")
    error_url = models.CharField(max_length=1000, verbose_name='Error URL', help_text="A URL to redirect the user to if an error occurs while submitting the form.  eg. /contact/error")
    
    def get_recipient_list(self):
        return [x.strip() for x in self.recipient_emails.split(',')]
    
    def get_form(self, *args, **kwargs):
        if args:
            form = thunderchild.forms.ContactForm(*args)
        else:
            form = thunderchild.forms.ContactForm(initial={'form_id':self.id})
        return form
