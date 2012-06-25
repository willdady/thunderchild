from datetime import datetime
import json
import os.path
from django.db import models
from django.conf import settings
from django.forms.models import ModelForm
from django.forms.widgets import Select, HiddenInput, RadioSelect, TextInput,\
    Textarea
from django import forms
from django.contrib.auth.models import User
import thunderchild.forms
from thunderchild.validators import validate_lowercase, validate_urlchars
from django.utils.timezone import utc


class EntryType(models.Model):
    fieldgroup = models.ForeignKey('FieldGroup', blank=True, null=True, on_delete=models.SET_NULL)
    categorygroup = models.ForeignKey('CategoryGroup', blank=True, null=True, on_delete=models.SET_NULL)
    entrytype_name = models.CharField(max_length=80, unique=True, verbose_name='Name')
    entrytype_short_name = models.SlugField(max_length=80, unique=True, verbose_name='Short name')
    
    def get_form(self, *args, **kwargs):
        fields = Field.objects.filter(fieldgroup__exact=self.fieldgroup.id).order_by('field_display_order', 'field_name')
        form = thunderchild.forms.DynamicForm(fields, *args, **kwargs)
        return form
    
    
class Entry(models.Model):
    entrytype = models.ForeignKey(EntryType)
    author = models.ForeignKey(User)
    title = models.CharField(max_length=300, verbose_name='Title')
    slug = models.SlugField(max_length=255, unique=True, verbose_name='Slug')
    creation_date = models.DateTimeField(verbose_name='Created on')
    last_modified_date = models.DateTimeField(auto_now=True, verbose_name='Last modified')
    expiration_date = models.DateTimeField(verbose_name='Expires on', blank=True, null=True)
    is_published = models.BooleanField(default=True, verbose_name='Published?', choices=((False, 'No'),(True, 'Yes')))
    categories = models.ManyToManyField('Category', blank=True)
    
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
    field_name = models.CharField(max_length=80)
    field_short_name = models.SlugField(max_length=80, unique=True, verbose_name='Short name')
    field_instructions = models.CharField(max_length=500, blank=True, verbose_name='Instructions')
    field_is_required = models.BooleanField(default=True, choices=((False, 'No'),(True, 'Yes')))
    field_display_order = models.IntegerField(default=0, verbose_name='Display order', help_text='The display order of this field in relation to other fields in this group.')
    field_collapsed_by_default = models.BooleanField(default=False, choices=((False, 'No'),(True, 'Yes')), verbose_name='Collapsed by default')
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
    
    
class TemplateGroup(models.Model):
    templategroup_short_name = models.CharField(max_length=125, unique=True, verbose_name='Name', validators=[validate_lowercase, validate_urlchars], error_messages={'unique':'A template group already exists with that name'})
    
    def __unicode__(self):
        return u'{}'.format(self.templategroup_short_name)
    
class Template(models.Model):
    templategroup = models.ForeignKey('TemplateGroup')
    template_short_name = models.CharField(max_length=125, verbose_name='Name', validators=[validate_lowercase, validate_urlchars])
    template_uid = models.CharField(max_length=255, unique=True)
    template_content_type = models.CharField(max_length=50, default='text/html', verbose_name='Content type')
    template_cache_timeout = models.IntegerField(default=0, verbose_name='Cache timeout', help_text='Number of seconds the rendered template should be cached for before being re-rendered. Recommended for templates that do not change often.')
    template_is_private = models.BooleanField(default=False, choices=((False, 'No'),(True, 'Yes')), verbose_name='Is private?', help_text="Private templates are not publicly accessible. They're intended for use as base templates to extend from or as fragments for including in other templates.")
    template_content = models.TextField(default='{% load thunderchild_tags %}', verbose_name='Content')
    
    def set_data(self, data):
       for key, value in data.items():
           if hasattr(self, key):
               setattr(self, key, value)
               
               
class CategoryGroup(models.Model):
    categorygroup_name = models.CharField(max_length=255, unique=True, verbose_name='Name')
    
    def __unicode__(self):
        return u'{}'.format(self.categorygroup_name)
               
               
class Category(models.Model):
    categorygroup = models.ForeignKey(CategoryGroup)
    category_name = models.CharField(max_length=255, unique=True, verbose_name='Name')
    category_short_name = models.SlugField(max_length=255, verbose_name='Short name')

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
    
    @property
    def url(self):
        url = self.base_url + self.directory + self.filename
        return url.replace('{ MEDIA_URL }', settings.MEDIA_URL)
    
    @property
    def thumbnail_url(self):
        if not self.thumbnail:
            return None
        url = self.base_url + self.directory + self.thumbnail
        return url.replace('{ MEDIA_URL }', settings.MEDIA_URL)
    
    @property
    def file_path(self):
        return os.path.join(settings.MEDIA_ROOT, self.directory, self.filename)
    
    @property
    def thumbnail_path(self):
        return os.path.join(settings.MEDIA_ROOT, self.directory, self.thumbnail)
    
    @property
    def is_image(self):
        return self.type == 'image/jpeg' or self.type == 'image/png' or self.type == 'image/gif'

    def __unicode__(self):
        return u'{}'.format(self.id)

# FORMS


class EntryTypeForm(ModelForm):
    fieldgroup = forms.ModelChoiceField(queryset=FieldGroup.objects.all(), required=False)
    categorygroup = forms.ModelChoiceField(queryset=CategoryGroup.objects.all(), required=False)
    class Meta:
        model = EntryType
        widgets = {
                   'entrytype_name':TextInput(attrs={'class':'input-large'}),
                   'entrytype_short_name':TextInput(attrs={'class':'input-large'}),
                   }
        
        
class EntryForm(ModelForm):
    
    def __init__(self, entrytype_model, *args, **kwargs):
        super(EntryForm, self).__init__(*args, **kwargs)
        categories_queryset = Category.objects.filter(categorygroup__exact=entrytype_model.categorygroup)
        if categories_queryset:
            self.fields['categories'] = forms.ModelMultipleChoiceField(queryset=categories_queryset, 
                                                                   widget=forms.CheckboxSelectMultiple,
                                                                   required=False)
    
    class Meta:
        model = Entry
        exclude = ['author', 'categories']
        widgets  = {
                    'entrytype':HiddenInput(),
                    'title':TextInput(attrs={'class':'input-large'}),
                    'slug':TextInput(attrs={'class':'input-large'}),
                    'creation_date':TextInput(attrs={'class':'input-medium', 'data-field-type':'datetime'}),
                    'expiration_date':TextInput(attrs={'class':'input-medium', 'data-field-type':'datetime'}),
                    'is_published':RadioSelect()
        }
        

FIELD_TYPES = (('text', 'Text'), 
               ('textarea', 'TextArea'), 
               ('datetime', 'DateTime'),
               ('date', 'Date'),
               ('select', 'Select Dropdown'),
               ('checkboxes', 'Checkboxes'),
               ('radiobuttons', 'Radio Buttons'),
               ('file', 'File'))

class FieldForm(ModelForm):
    
    maxlength = forms.IntegerField(help_text='The maximum number of characters allowed.', initial=128, required=False, widget=TextInput(attrs={'class':'input-small'}))
    field_choices = thunderchild.forms.TextToChoicesField(help_text='One choice per line. Minimum 2 choices.', required=False, widget=Textarea(attrs={'class':'input-large'}))
    
    def __init__(self, *args, **kwargs):
        instance = kwargs.get('instance')
        if instance:
            # If our form has a model instance and it contains field_options, parse the data from JSON back to native Python and use as initial data for the form.
            if instance.field_options:
                initial = kwargs.get('initial', {})
                json_data = json.loads(instance.field_options)
                if 'field_choices' in json_data:
                    field_choices = ''
                    for choice in json_data['field_choices']:
                        field_choices = field_choices + choice[1] + '\r'
                    initial['field_choices'] = field_choices[0:-1]
                if 'maxlength' in json_data:
                    initial['maxlength'] = json_data['maxlength']
                kwargs['initial'] = initial
            
        super(FieldForm, self).__init__(*args, **kwargs)
        
    def clean(self):
        cleaned_data = super(FieldForm, self).clean()
        field_type = cleaned_data.get('field_type')
        maxlength = cleaned_data.get('maxlength')
        field_choices = cleaned_data.get('field_choices')
        # We validate our field options conditionally, based on the value of field_type. For example, max_length must be specified for 'text' and 'textarea' types
        # but is not required for 'select' and 'radiobuttons' types.
        if (field_type == 'text' or field_type == 'textarea') and (maxlength <= 0 or maxlength == None):
            if maxlength <= 0:
                self._errors['maxlength'] = self.error_class(['Value must be greater than 0'])
            if maxlength == None:
                self._errors['maxlength'] = self.error_class(['This field is required'])
        if (field_type == 'select' or field_type == 'radiobuttons') and len(field_choices) < 2:
            self._errors['field_choices'] = self.error_class(['Field must have at least two choices'])
        # Convert the appropriate options for the specified field_type to JSON and store in cleaned_data['field_options'].
        if field_type == 'text' or field_type == 'textarea':
            options = json.dumps({'maxlength':maxlength})
            cleaned_data['field_options'] = options
        elif field_type == 'select' or field_type == 'checkboxes' or field_type == 'radiobuttons':
            options = json.dumps({'field_choices':field_choices})
            cleaned_data['field_options'] = options
        
        del cleaned_data['maxlength']
        del cleaned_data['field_choices']        
    
        return cleaned_data
    
    class Meta:
        model = Field
        exclude = ['field_options'] # We don't render the field_options field as it's populated with JSON in the above clean method.
        widgets  = {
                    'field_name':TextInput(attrs={'class':'input-large'}),
                    'field_short_name':TextInput(attrs={'class':'input-large'}),
                    'field_instructions':TextInput(attrs={'class':'input-large'}),
                    'field_display_order':TextInput(attrs={'class':'input-small'}),
                    'field_is_required':RadioSelect(),
                    'field_collapsed_by_default':RadioSelect(),
                    'field_type':Select(choices=FIELD_TYPES),
                    'fieldgroup':HiddenInput()
        }
        

class FieldGroupForm(ModelForm):
    class Meta:
        model = FieldGroup
        widgets = {
                   'fieldgroup_name':TextInput(attrs={'class':'input-large'})
                   }
      
      
class TemplateGroupForm(ModelForm):
    class Meta:
        model = TemplateGroup
        widgets = {
                   'templategroup_short_name':TextInput(attrs={'class':'input-large'})
                   }
        
      
TEMPLATE_CONTENT_TYPES = (('text/html', 'HTML'),
                          ('text/xhtml+xml', 'XHTML'), 
                          ('text/css', 'CSS'), 
                          ('text/xml', 'XML'), 
                          ('application/rss+xml', 'RSS'), 
                          ('application/json', 'JSON'),
                          ('application/javascript', 'Javascript'),
                          ('text/plain', 'Text'))  
class TemplateForm(ModelForm):
    class Meta:
        model = Template
        exclude = ['template_uid']
        widgets  = {
                    'template_content_type':Select(choices=TEMPLATE_CONTENT_TYPES),
                    'templategroup':HiddenInput(),
                    'template_short_name':TextInput(attrs={'class':'input-large'}),
                    'template_is_private':RadioSelect(),
                    'template_content':Textarea(attrs={'class':'input-large'})
        }
    
    def __init__(self, *args, **kwargs):
        super(TemplateForm, self).__init__(*args, **kwargs)
        # If the template is an index template, disable the name input as index templates cannot be renamed.
        if self.instance:
            if self.instance.template_short_name == 'index':
                self.fields['template_short_name'].widget = HiddenInput()
    
    def clean(self):
        '''
        Validates that template_short_name is not already assigned to a different Template within the same group.
        '''
        cleaned_data = super(TemplateForm, self).clean()
        
        templategroup = cleaned_data.get('templategroup')
        template_short_name = cleaned_data.get('template_short_name')
        
        if templategroup and template_short_name:
            #If instance.id is set then we are editing an existing Template.
            if self.instance.id:
                #Find a Template with matching templategroup and template_short_name as specified in our cleaned_data. If this template is NOT
                #the same as our instance then template_short_name is already assigned to a different Template in the same group and therefore can't be changed.
                existing = Template.objects.filter(templategroup__exact=templategroup).filter(template_short_name__exact=template_short_name)
                if len(existing) == 0:
                    return cleaned_data
                existing = existing[0]
                if existing.id == self.instance.id:
                    return cleaned_data
                else:
                    self._errors['template_short_name'] = self.error_class(['A template with this name already exists within this group. Please choose another name.'])
                    del cleaned_data['template_short_name']
            else:
                #No instance.id? Then we're creating a new template. We make sure template_short_name is not already assigned to a template in the same group.
                if Template.objects.filter(templategroup__exact=templategroup).filter(template_short_name__exact=template_short_name).exists():
                    self._errors['template_short_name'] = self.error_class(['A template with this name already exists within this group'])
                    del cleaned_data['template_short_name']
        return cleaned_data
    

class CategoryGroupForm(ModelForm):
    class Meta:
        model = CategoryGroup
        widgets = {'categorygroup_name':TextInput(attrs={'class':'input-large'})}    
    

class CategoryForm(ModelForm):
    class Meta:
        model = Category
        widgets = {
                   'categorygroup':HiddenInput(),
                   'category_name':TextInput(attrs={'class':'input-large'}),
                   'category_short_name':TextInput(attrs={'class':'input-large'})
                   }
        