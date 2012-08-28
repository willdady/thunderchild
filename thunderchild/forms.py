import json
from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from django.contrib.auth.models import Permission
import thunderchild
from thunderchild.validators import validate_color

class DynamicForm(forms.Form):
    
    def __init__(self, fields, *args, **kwargs):
        super(DynamicForm, self).__init__(*args, **kwargs)
        
        for field in fields:
            
            if field.field_type == 'text':
                options = json.loads(field.field_options)
                self.fields[field.field_short_name] = forms.CharField(max_length=options['max_length'], help_text=field.field_instructions, widget=forms.TextInput(attrs={'class':'input-xxlarge'}))
            if field.field_type == 'textarea':
                options = json.loads(field.field_options)
                self.fields[field.field_short_name] = forms.CharField(max_length=options['max_length'], help_text=field.field_instructions, widget=forms.Textarea(attrs={'class':'input-xxlarge'}))
            if field.field_type == 'datetime':
                self.fields[field.field_short_name] = forms.DateTimeField(help_text=field.field_instructions, widget=forms.TextInput(attrs={'class':'input-medium', 'data-field-type':'datetime'}))
            if field.field_type == 'date':
                self.fields[field.field_short_name] = forms.DateField(help_text=field.field_instructions, widget=forms.TextInput(attrs={'class':'input-medium', 'data-field-type':'date'}))
            if field.field_type == 'boolean':
                self.fields[field.field_short_name] = forms.BooleanField(help_text=field.field_instructions)
                self.fields[field.field_short_name].required = False # Required is set to False regardless of the value of field.field_is_required because a False value is never sent with the form.
            if field.field_type == 'select':
                options = json.loads(field.field_options)
                self.fields[field.field_short_name] = forms.ChoiceField(help_text=field.field_instructions, choices=options['field_choices'])
            if field.field_type == 'radiobuttons':
                options = json.loads(field.field_options)
                self.fields[field.field_short_name] = forms.ChoiceField(help_text=field.field_instructions, choices=options['field_choices'], widget=forms.RadioSelect)
            if field.field_type == 'checkboxes':
                options = json.loads(field.field_options)
                self.fields[field.field_short_name] = forms.MultipleChoiceField(help_text=field.field_instructions, choices=options['field_choices'], widget=forms.CheckboxSelectMultiple)
            if field.field_type == 'file':  
                self.fields[field.field_short_name] = forms.CharField(help_text=field.field_instructions, widget=forms.TextInput(attrs={'data-field-type':'file'}))
            if field.field_type == 'color':  
                self.fields[field.field_short_name] = forms.CharField(help_text=field.field_instructions, initial='#000000', validators=[validate_color], widget=forms.TextInput(attrs={'data-field-type':'color'}))
                
            if not field.field_type == 'boolean':
                self.fields[field.field_short_name].required = field.field_is_required
            self.fields[field.field_short_name].field_collapsed_by_default = field.field_collapsed_by_default
            
                
class LoginForm(forms.Form):
    username = forms.CharField(max_length=30)
    password = forms.CharField(widget=forms.PasswordInput())
    remember_me = forms.BooleanField(required=False)
                
                
class TextToChoicesField(forms.CharField):
    def __init__(self, max_length=None, min_length=None, *args, **kwargs):
        if not 'widget' in kwargs:
            kwargs['widget'] = forms.Textarea()
        super(TextToChoicesField, self).__init__(max_length=None, min_length=None, *args, **kwargs)
    
    def to_python(self, value):
        '''
        Coerces the choices into a list of 2-tuples where each value is identical.
        '''
        return [(choice.strip(), choice.strip()) for choice in value.split('\r') if choice.strip() and choice != '\n']

    def validate(self, value):
        '''
        Validates we have at least two choices to choose from.
        '''
        if len(value) < 2 and self.required == True:
            raise ValidationError('Field must have at least two choices')
        return True
    
    
class UserCreationForm(forms.ModelForm):
    error_messages = {
        'duplicate_username':"A user with that username already exists.",
        'password_mismatch':"The two password fields didn't match.",
    }
    username = forms.RegexField(
        label="Username", 
        max_length=30,
        regex=r'^[\w.@+-]+$',
        help_text = "Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.",
        error_messages = {'invalid': "This value may contain only letters, numbers and @/./+/-/_ characters."},
        widget=forms.TextInput(attrs={'class':'input-xxlarge'})
    )
    first_name = forms.CharField(max_length=30, label="First name", widget=forms.TextInput(attrs={'class':'input-xxlarge'}))
    last_name = forms.CharField(max_length=30, label="Last name", widget=forms.TextInput(attrs={'class':'input-xxlarge'}))
    email = forms.EmailField(widget=forms.TextInput(attrs={'class':'input-xxlarge'}))
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Password confirmation", widget=forms.PasswordInput, help_text = "Enter the same password as above, for verification.")

    class Meta:
        model = User
        exclude = ['password','user_permissions', 'last_login', 'date_joined']

    def clean_username(self):
        # Since User.username is unique, this check is redundant,
        # but it sets a nicer error message than the ORM. See #13147.
        username = self.cleaned_data["username"]
        try:
            User.objects.get(username=username)
        except User.DoesNotExist:
            return username
        raise forms.ValidationError(self.error_messages['duplicate_username'])

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1", "")
        password2 = self.cleaned_data["password2"]
        if password1 != password2:
            raise forms.ValidationError(
                self.error_messages['password_mismatch'])
        return password2

    def save(self, commit=True):
        user = super(UserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user
    
    
class ContactForm(forms.Form):
    entry_id = forms.IntegerField(widget=forms.HiddenInput)
    email = forms.EmailField()
    subject = forms.CharField(max_length=150)
    message = forms.CharField(max_length=300, widget=forms.Textarea)


class CommentForm(forms.Form):
    entry_id = forms.IntegerField(widget=forms.HiddenInput)
    name = forms.CharField()
    email = forms.EmailField(max_length=100)
    website = forms.URLField(required=False)
    body = forms.CharField(max_length=500, widget=forms.Textarea)    

