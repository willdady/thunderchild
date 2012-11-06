from django.conf.urls import patterns, include, url
from django.conf import settings

urlpatterns = patterns('',
    (r'^dashboard/login$', 'thunderchild.views.login'),
    (r'^dashboard/logout$', 'thunderchild.views.logout'),
    (r'^dashboard$', 'thunderchild.views.dashboard'),
    
    (r'^dashboard/media$', 'thunderchild.media_views.media'),
    (r'^dashboard/media/upload$', 'thunderchild.media_views.upload'),
    (r'^dashboard/media/assets$', 'thunderchild.media_views.assets'),
    (r'^dashboard/media/chooser$', 'thunderchild.media_views.media_chooser'),
    
    (r'^dashboard/users$', 'thunderchild.views.users'),
    
    (r'^dashboard/fields$', 'thunderchild.field_views.fields'),
    (r'^dashboard/fields/fieldgroups$', 'thunderchild.field_views.fieldgroups_post'),
    (r'^dashboard/fields/fieldgroups/(\d+)$', 'thunderchild.field_views.fieldgroups_put_get_delete'),
    (r'^dashboard/fields/fields$', 'thunderchild.field_views.field_post'),
    (r'^dashboard/fields/fields/(\d+)$', 'thunderchild.field_views.field_put_get_delete'),
    
    (r'^dashboard/categories$', 'thunderchild.category_views.categories'),
    (r'^dashboard/categories/categorygroups$', 'thunderchild.category_views.categorygroup_post'),
    (r'^dashboard/categories/categorygroups/(\d+)$', 'thunderchild.category_views.categorygroup_put_get_delete'),
    (r'^dashboard/categories/categories$', 'thunderchild.category_views.category_post'),
    (r'^dashboard/categories/categories/(\d+)$', 'thunderchild.category_views.category_put_get_delete'),
    
    (r'^dashboard/entry-types$', 'thunderchild.entry_views.entrytypes'),
    (r'^dashboard/entry-types/entry-type$', 'thunderchild.entry_views.entrytypes_post'),
    (r'^dashboard/entry-types/entry-type/(\d+)$', 'thunderchild.entry_views.entrytypes_put_get_delete'),
    (r'^dashboard/entries$', 'thunderchild.entry_views.entries'),
    (r'^dashboard/entries/create/(\d+)$', 'thunderchild.entry_views.create_entry'),
    (r'^dashboard/entries/edit/(\d+)$', 'thunderchild.entry_views.edit_entry'),
    (r'^dashboard/entries/delete$', 'thunderchild.entry_views.delete_entry'),
    
    (r'^dashboard/templates$', 'thunderchild.template_views.templates'),
    
    (r'^dashboard/api/templates/group$', 'thunderchild.template_views.group_create'),
    (r'^dashboard/api/templates/group/(\d+)$', 'thunderchild.template_views.group'),
    (r'^dashboard/api/templates/template$', 'thunderchild.template_views.template_create'),
    (r'^dashboard/api/templates/template/(\d+)$', 'thunderchild.template_views.template'),
    
    (r'^dashboard/forms/contact$', 'thunderchild.form_views.contactforms'),
    (r'^dashboard/forms/contact/create$', 'thunderchild.form_views.create_contactform'),
    (r'^dashboard/forms/contact/edit/(\d+)$', 'thunderchild.form_views.edit_contactform'),
    (r'^dashboard/forms/contact/process/(\d+)$', 'thunderchild.form_views.process_contactform'),
    (r'^dashboard/forms/contact/delete', 'thunderchild.form_views.delete_contactform'),
    
    (r'^dashboard/comments$', 'thunderchild.comment_views.comments'),
    (r'^dashboard/comments/submit$', 'thunderchild.comment_views.submit'),
    (r'^dashboard/comments/edit/(\d+)$', 'thunderchild.comment_views.edit'),
    (r'^dashboard/comments/delete$', 'thunderchild.comment_views.delete'),
    (r'^dashboard/comments/bulk-action$', 'thunderchild.comment_views.bulk_action'),
)

if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
        }),
    )
    
urlpatterns += patterns('',
    (r'^(.*)$', 'thunderchild.dynamic_view.dynamic_view'),
)