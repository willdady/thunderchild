from django import forms
from django.contrib.auth.models import User
from django.forms.models import ModelForm
from django.forms.widgets import TextInput, RadioSelect, HiddenInput, Textarea, \
    Select
from thunderchild import models
import thunderchild.forms
import json


class SiteSettingsForm(forms.ModelForm):
    class Meta:
        model = models.SiteSettings


class EntryTypeForm(ModelForm):
    fieldgroup = forms.ModelChoiceField(queryset=models.FieldGroup.objects.all(), required=False, label='Field group')
    categorygroup = forms.ModelChoiceField(queryset=models.CategoryGroup.objects.all(), required=False, label='Category group')
    class Meta:
        model = models.EntryType
        widgets = {
                   'entrytype_name':TextInput(attrs={'class':'input-large'}),
                   'entrytype_short_name':TextInput(attrs={'class':'input-large'}),
                   }
        
        
class EntryForm(ModelForm):
    
    def __init__(self, entrytype_model, *args, **kwargs):
        super(EntryForm, self).__init__(*args, **kwargs)
        categories_queryset = models.Category.objects.filter(categorygroup__exact=entrytype_model.categorygroup)
        if categories_queryset:
            self.fields['categories'] = forms.ModelMultipleChoiceField(queryset=categories_queryset, 
                                                                   widget=forms.CheckboxSelectMultiple,
                                                                   required=False)
    
    class Meta:
        model = models.Entry
        exclude = ['author']
        widgets  = {
                    'entrytype':HiddenInput(),
                    'title':TextInput(attrs={'class':'input-large'}),
                    'slug':TextInput(attrs={'class':'input-large'}),
                    'creation_date':TextInput(attrs={'class':'input-medium', 'data-field-type':'datetime'}),
                    'expiration_date':TextInput(attrs={'class':'input-medium', 'data-field-type':'datetime'}),
                    'is_published':RadioSelect(),
                    'comments_enabled':RadioSelect(),
                    'comments_expiration_date':TextInput(attrs={'class':'input-medium', 'data-field-type':'datetime'})
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
        model = models.Field
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
        model = models.FieldGroup
        widgets = {
                   'fieldgroup_name':TextInput(attrs={'class':'input-large'})
                   }
        
        
class TemplateGroupForm(ModelForm):
    class Meta:
        model = models.TemplateGroup
        widgets = {
                   'templategroup_short_name':TextInput(attrs={'class':'input-large'})
                   }
        
      
TEMPLATE_CONTENT_TYPES = (('text/html', 'HTML - text/html'),
                          ('text/xhtml+xml', 'XHTML - text/xhtml+xml'), 
                          ('text/css', 'CSS - text/css'),
                          ('application/javascript', 'Javascript - application/javascript'), 
                          ('application/json', 'JSON - application/json'),
                          ('application/rss+xml', 'RSS - application/rss+xml'), 
                          ('application/atom+xml', 'Atom - application/atom+xml'),
                          ('text/xml', 'XML - text/xml'),
                          ('text/csv', 'CSV - text/csv'),  
                          ('application/soap+xml', 'SOAP - application/soap+xml'), 
                          ('text/vcard', 'vCard - text/vcard'),
                          ('text/plain', 'Text - text/plain'))  

class TemplateForm(ModelForm):
    class Meta:
        model = models.Template
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
                existing = models.Template.objects.filter(templategroup__exact=templategroup).filter(template_short_name__exact=template_short_name)
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
                if models.Template.objects.filter(templategroup__exact=templategroup).filter(template_short_name__exact=template_short_name).exists():
                    self._errors['template_short_name'] = self.error_class(['A template with this name already exists within this group'])
                    del cleaned_data['template_short_name']
        return cleaned_data
    
    
class CategoryGroupForm(ModelForm):
    class Meta:
        model = models.CategoryGroup
        widgets = {'categorygroup_name':TextInput(attrs={'class':'input-large'})}    
    

class CategoryForm(ModelForm):
    class Meta:
        model = models.Category
        widgets = {
                   'categorygroup':HiddenInput(),
                   'category_name':TextInput(attrs={'class':'input-large'}),
                   'category_short_name':TextInput(attrs={'class':'input-large'})
                   }
        

class EntriesFilterForm(forms.Form):
    entrytype = forms.ChoiceField(choices=[], required=False, label="Entry type")
    author = forms.ChoiceField(choices=[], required=False)
    
    def __init__(self, *args, **kwargs):
        super(EntriesFilterForm, self).__init__(*args, **kwargs)
        
        entrytype_choices = [('', '---------')]
        entrytypes = models.EntryType.objects.values_list('id', 'entrytype_name')
        for e in entrytypes:
            entrytype_choices.append(e)
        self.fields['entrytype'].choices = entrytype_choices
        
        author_choices = [('', '---------')]
        authors = User.objects.values_list('id', 'first_name', 'last_name')
        for a in authors:
            author_choices.append((a[0], '{} {}'.format(a[1], a[2]).strip()))
        self.fields['author'].choices = author_choices
    
    
class ContactFormForm(ModelForm):
    class Meta:
        model = models.ContactForm
        widgets = {
                   'contactform_name':TextInput(attrs={'class':'input-large'}),
                   'contactform_short_name':TextInput(attrs={'class':'input-large'}),
                   'recipient_emails':TextInput(attrs={'class':'input-large'}),
                   'success_url':TextInput(attrs={'class':'input-large'}),
                   'error_url':TextInput(attrs={'class':'input-large'})
                   }


class CommentModelForm(ModelForm):
    class Meta:
        model = models.Comment
        exclude = ['entry']
        widgets = {
                   'name':TextInput(attrs={'class':'input-large'}),
                   'email':TextInput(attrs={'class':'input-large'}),
                   'website':TextInput(attrs={'class':'input-large'}),
                   'ip_address':TextInput(attrs={'class':'input-large'}),
                   }
    
    
    
    