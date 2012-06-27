from django import template
from django.conf import settings
from django.core.urlresolvers import reverse
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
        return ''
    
    entries = models.Entry.objects.filter(entrytype__exact=entrytype)

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
    {% get_entry slug='test' as my_entry %}
    or
    {% get_entry id=3 as my_entry %}
    
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
