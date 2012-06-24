from django.conf.urls import patterns, include, url
from django.conf import settings

urlpatterns = patterns('',
    (r'^backend/login$', 'thunderchild.views.login'),
    (r'^backend/logout$', 'thunderchild.views.logout'),
    (r'^backend$', 'thunderchild.views.dashboard'),
    
    (r'^backend/media/(\d+)$', 'thunderchild.media_views.media'),
    (r'^backend/media/upload$', 'thunderchild.media_views.upload'),
    
    (r'^backend/users$', 'thunderchild.views.users'),
    (r'^backend/users/create$', 'thunderchild.views.create_user'),
    (r'^backend/users/edit/(\d+)$', 'thunderchild.views.edit_user'),
    (r'^backend/users/groups$', 'thunderchild.views.groups'),
    (r'^backend/users/groups/create$', 'thunderchild.views.create_group'),
    (r'^backend/users/groups/edit/(\d+)$', 'thunderchild.views.edit_group'),
    
    (r'^backend/field-groups$', 'thunderchild.field_views.fieldgroups'),
    (r'^backend/field-groups/create$', 'thunderchild.field_views.create_fieldgroup'),
    (r'^backend/field-groups/edit/(\d+)$', 'thunderchild.field_views.edit_fieldgroup'),
    (r'^backend/field-groups/delete/(\d+)$', 'thunderchild.field_views.delete_fieldgroup'),
    (r'^backend/field-groups/(\d+)/create$', 'thunderchild.field_views.create_field'),
    (r'^backend/field-groups/(\d+)/edit/(\d+)$', 'thunderchild.field_views.edit_field'),
    (r'^backend/field-groups/(\d+)/delete/(\d+)$', 'thunderchild.field_views.delete_field'),
    
    (r'^backend/category-groups$', 'thunderchild.category_views.categorygroups'),
    (r'^backend/category-groups/create$', 'thunderchild.category_views.create_categorygroup'),
    (r'^backend/category-groups/edit/(\d+)$', 'thunderchild.category_views.edit_categorygroup'),
    (r'^backend/category-groups/delete/(\d+)$', 'thunderchild.category_views.delete_categorygroup'),
    (r'^backend/category-groups/(\d+)/create$', 'thunderchild.category_views.create_category'),
    (r'^backend/category-groups/(\d+)/edit/(\d+)$', 'thunderchild.category_views.edit_category'),
    (r'^backend/category-groups/(\d+)/delete/(\d+)$', 'thunderchild.category_views.delete_category'),
    
    (r'^backend/entry-types$', 'thunderchild.entry_views.entrytypes'),
    (r'^backend/entry-types/create$', 'thunderchild.entry_views.create_entrytype'),
    (r'^backend/entry-types/edit/(\d+)$', 'thunderchild.entry_views.edit_entrytype'),
    (r'^backend/entry-types/delete/(\d+)$', 'thunderchild.entry_views.delete_entrytype'),
    (r'^backend/entries$', 'thunderchild.entry_views.entries'),
    (r'^backend/entries/create/(\d+)$', 'thunderchild.entry_views.create_entry'),
    (r'^backend/entries/edit/(\d+)$', 'thunderchild.entry_views.edit_entry'),
    
    (r'^backend/templates$', 'thunderchild.template_views.templates'),
    (r'^backend/templates/group/create$', 'thunderchild.template_views.create_templategroup'),
    (r'^backend/templates/group/edit/(\d+)$', 'thunderchild.template_views.edit_templategroup'),
    (r'^backend/templates/group/delete/(\d+)$', 'thunderchild.template_views.delete_templategroup'),
    (r'^backend/templates/group/(\d+)/create$', 'thunderchild.template_views.create_template'),
    (r'^backend/templates/group/(\d+)/edit/(\d+)', 'thunderchild.template_views.edit_template'),
    (r'^backend/templates/group/(\d+)/delete/(\d+)', 'thunderchild.template_views.delete_template'),
    
)

if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
        }),
    )
    
#urlpatterns += patterns('',
#    (r'^(.*)$', 'thunderchild.dynamic_view.dynamic_view'),
#)