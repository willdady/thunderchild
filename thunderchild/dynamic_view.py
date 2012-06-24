from django.shortcuts import get_object_or_404
from django.template import Template
from django.template.response import TemplateResponse
from thunderchild.models import Template as TemplateModel
from django.http import HttpResponse, Http404
from django.template.context import RequestContext
from django.core.cache import cache
from django.template.loader import get_template

def dynamic_view(request, path):
    context = {}
    # Split the path into segments and add each to our context. 
    # Note we use path instead of request.path_info as the former does not include the part of the url where are app is mounted.
    # For example, if our app is mounted at example.com/foo segment_1 will ALWAYS be equal to foo if splitting on request.path_info.
    segments = [segment for segment in path.split('/') if segment]
    for index, value in enumerate(segments):
        context['segment_{}'.format(index+1)] = value
    num_segments = len(segments)
    if num_segments > 0:
        context['last_segment'] = segments[-1]
    # Resolve our template's name
    if num_segments == 0:
        template_name = 'root/index'
    elif num_segments == 1:
        # If there is only one segment assume we want a template from the root group. If no such template exists in the root group, see if a group exists with this name (see try block below).
        template_name = 'root/{}'.format(segments[0]) 
    elif num_segments > 1:
        template_name = '{}/{}'.format(segments[0], segments[1])
        
    # Load the TemplateModel
    try:
        model = TemplateModel.objects.get(template_uid__exact=template_name)
    except TemplateModel.DoesNotExist:
        template_name = '{}/index'.format(segments[0])
        model = get_object_or_404(TemplateModel, template_uid__exact=template_name)
        
    # If the template is private return 404
    if model.template_is_private:
        raise Http404
        
    # If we have our template cached no need to process it further. Simply return it.
    cached_template = cache.get(path)
    if cached_template:
        print 'returning cached template'
        return HttpResponse(cached_template, content_type=model.template_content_type)
    
    compiled_template = get_template(template_name)
    rendered_template = compiled_template.render(RequestContext(request, context))
    
    if model.template_cache_timeout > 0:
        cache.set(path, rendered_template, model.template_cache_timeout)
    return HttpResponse(rendered_template, content_type=model.template_content_type)



