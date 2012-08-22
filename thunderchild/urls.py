from django.conf.urls import patterns, include, url
from django.conf import settings

urlpatterns = patterns('',
    (r'^dashboard/login$', 'thunderchild.views.login'),
    (r'^dashboard/logout$', 'thunderchild.views.logout'),
    (r'^dashboard$', 'thunderchild.views.dashboard'),
    
    (r'^dashboard/media$', 'thunderchild.media_views.media'),
    (r'^dashboard/media/upload$', 'thunderchild.media_views.upload'),
    (r'^dashboard/media/replace$', 'thunderchild.media_views.replace'),
    (r'^dashboard/media/assets$', 'thunderchild.media_views.assets'),
    (r'^dashboard/media/chooser$', 'thunderchild.media_views.media_chooser'),
    
    (r'^dashboard/users$', 'thunderchild.views.users'),
    
    (r'^dashboard/fields$', 'thunderchild.field_views.fields'),
    (r'^dashboard/fields/create$', 'thunderchild.field_views.create_fieldgroup'),
    (r'^dashboard/fields/edit/(\d+)$', 'thunderchild.field_views.edit_fieldgroup'),
    (r'^dashboard/fields/delete$', 'thunderchild.field_views.delete_fieldgroup'),
    (r'^dashboard/fields/(\d+)/create$', 'thunderchild.field_views.create_field'),
    (r'^dashboard/fields/(\d+)/edit/(\d+)$', 'thunderchild.field_views.edit_field'),
    (r'^dashboard/fields/(\d+)/delete$', 'thunderchild.field_views.delete_field'),
    
    (r'^dashboard/categories$', 'thunderchild.category_views.categories'),
    (r'^dashboard/categories/create$', 'thunderchild.category_views.create_categorygroup'),
    (r'^dashboard/categories/edit/(\d+)$', 'thunderchild.category_views.edit_categorygroup'),
    (r'^dashboard/categories/delete$', 'thunderchild.category_views.delete_categorygroup'),
    (r'^dashboard/categories/(\d+)/create$', 'thunderchild.category_views.create_category'),
    (r'^dashboard/categories/(\d+)/edit/(\d+)$', 'thunderchild.category_views.edit_category'),
    (r'^dashboard/categories/(\d+)/delete$', 'thunderchild.category_views.delete_category'),
    
    (r'^dashboard/entry-types$', 'thunderchild.entry_views.entrytypes'),
    (r'^dashboard/entry-types/create$', 'thunderchild.entry_views.create_entrytype'),
    (r'^dashboard/entry-types/edit/(\d+)$', 'thunderchild.entry_views.edit_entrytype'),
    (r'^dashboard/entry-types/delete$', 'thunderchild.entry_views.delete_entrytype'),
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