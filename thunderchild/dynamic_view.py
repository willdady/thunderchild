from django.core.cache import cache
from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404, redirect
from django.template import Template
from django.template.context import RequestContext
from django.template.loader import get_template
from django.template.response import TemplateResponse
from thunderchild.models import Template as TemplateModel

def dynamic_view(request, path):
    context = {}
    # Split the path into segments and add each to our context. 
    # Note we use path instead of request.path_info as the former does not include the part of the url where the app is mounted.
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
        #If we have only one segment and our path has a trailing slash treat the segment as a template group name. Otherwise we treat it as the name of a template in the root template group.
        if path[-1] == '/':
            template_name = '{}/index'.format(segments[0])
        else:
            template_name = 'root/{}'.format(segments[0]) 
    elif num_segments > 1:
        template_name = '{}/{}'.format(segments[0], segments[1])
        
    # Load the TemplateModel
    model = get_object_or_404(TemplateModel, template_uid__exact=template_name)
    
    # If the template is private return 404
    if model.template_is_private:
        raise Http404
        
    if model.is_redirected:
        if model.template_redirect_type == 301:
            return redirect(model.template_redirect_url, permanent=True)
        if model.template_redirect_type == 302:
            return redirect(model.template_redirect_url)
        
    # If we have our template cached no need to process it further. Simply return it.
    cached_template = cache.get(path)
    if cached_template:
        return HttpResponse(cached_template, content_type=model.template_content_type)
    
    compiled_template = get_template(template_name)
    rendered_template = compiled_template.render(RequestContext(request, context))
    
    if model.template_cache_timeout > 0:
        cache.set(path, rendered_template, model.template_cache_timeout)
    return HttpResponse(rendered_template, content_type=model.template_content_type)



