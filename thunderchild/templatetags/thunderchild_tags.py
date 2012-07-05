from datetime import datetime
from django import template
from django.conf import settings
from django.core.urlresolvers import reverse
from django.utils.timezone import now
from thunderchild import models

register = template.Library()

@register.assignment_tag(takes_context=True, name='entries')
def get_entries(context, entrytype_short_name, *args, **kwargs):
    """
    
    Example:
    {% entries 'blog_entry' offset=2 limit=3 year=2012 order_by='-title, author' as blog_entries %}
    
    """
    
    limit = kwargs.get('limit')
    offset = kwargs.get('offset', 0)
    order_by = kwargs.get('order_by')
    year = kwargs.get('year')
    month = kwargs.get('month')
    day = kwargs.get('day')
    
    try:
        entrytype = models.EntryType.objects.get(entrytype_short_name__exact=entrytype_short_name)
    except models.EntryType.DoesNotExist:
        return None
    
    # We get all entries of this EntryType EXCEPT those which have been marked as published = False AND/OR have expired.
    entries = models.Entry.objects.filter(entrytype__exact=entrytype, is_published__exact=True).exclude(expiration_date__lt=datetime.now())

    if order_by:
        order_by = [field_name.strip() for field_name in order_by.split(',')]
        entries = entries.order_by(*order_by)
    
    if year:
        entries = entries.filter(entry_creation_date__year=year)
    if month:
        entries = entries.filter(entry_creation_date__month=month)
    if day:
        entries = entries.filter(entry_creation_date__day=day)
    
    if offset and limit:
        entries = entries[offset:][:limit]
    elif limit:
        entries = entries[:limit]
    elif offset:
        entries = entries[offset:]
    
    list = []
    for entry in entries:
        list.append(entry.dict)
    return list


@register.assignment_tag(name='entry')
def get_entry(*args, **kwargs):
    """
    
    Example:
    {% entry slug='test' as my_entry %}
    or
    {% entry id=3 as my_entry %}
    
    """
    id = kwargs.get('id')
    slug = kwargs.get('slug')
    try:
        if id:
            model = models.Entry.objects.get(pk=id)
        elif slug:
            model = models.Entry.objects.get(slug__exact=slug)
    except models.Entry.DoesNotExist:
        return None
     
    if not model.is_published:
        return None
    
    if model.expiration_date:
        if model.expiration_date < now(): # Note we use Django's 'now' function as it will return either a naive or aware datetime according to settings.USE_TZ.
            return None
    
    return model.dict
        

@register.simple_tag(name='template_url') 
def get_template_url(*args, **kwargs):
    """
    Returns the absolute URL of the supplied template. The template should be supplied as "<template group>/<template name>"
    
    Example:
    {% template_url "staff/john-smith" %}
    """
    path = '/'.join(args)
    if path[0:5] == 'root/':
        path = path.replace('root/', '')
    return reverse('thunderchild.dynamic_view.dynamic_view', args=[path])


@register.simple_tag(name='media_asset')    
def get_media_asset(asset_id):
    """
    Returns the URL of a MediaAsset. Tag accepts a single argument, the id of the asset. If the asset does not exist an empty string is returned."
    
    Example:
    {% media_asset 12 %}
    """
    try:
        model = models.MediaAsset.objects.get(pk=asset_id)
    except models.MediaAsset.DoesNotExist:
        return ''
    url = model.url
    # Replace the substring '{ MEDIA_URL }' with the value defined in settings. No effect if doesn't exist in string.
    return url.replace('{ MEDIA_URL }', settings.MEDIA_URL)


@register.assignment_tag(name='contact_form') 
def get_contactform(*args, **kwargs):
    """
    Returns a dictionary object representing the ContactForm belonging to the passed id.
    
    The returned dictionary has the following parameters:
    action: The URL the form will submit to.
    method: The forms method (currently this will always be 'post').
    form: The actual form instance.
    
    Example:
    {% contact_form id=1 as my_form %}
    
    <form action="{{ my_form.action }}" method="{{ my_form.method }}">
        {% csrf_token %}
        <ul>
            {{ my_form.form.as_ul }}
            <li>
                <input type="submit" value="Send" />
            </li>
        </ul>
    </form>
    
    """
    id = kwargs.get('id')
    
    if not id:
        return ''
    try:
        model = models.ContactForm.objects.get(pk=id)
    except models.ContactForm.DoesNotExist:
        return ''
    
    form = model.get_form()
    action = reverse('thunderchild.form_views.process_contactform', args=[model.id])
    method = 'post'
    
    return {'action':action, 'method':method, 'form':form}
    
       