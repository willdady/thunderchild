from django.template.loader import BaseLoader, TemplateDoesNotExist
from thunderchild.models import Template as TemplateModel

class TemplateLoader(BaseLoader):
    
    is_usable = True
    
    def __call__(self, template_name, template_dirs=None):
        try:
            model = TemplateModel.objects.get(template_uid__exact=template_name)
        except TemplateModel.DoesNotExist:
            raise TemplateDoesNotExist
        return (model.template_content, template_name)