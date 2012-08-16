from django.conf.urls import patterns, include, url
from django.conf import settings

urlpatterns = patterns('',
    (r'^backend/login$', 'thunderchild.views.login'),
    (r'^backend/logout$', 'thunderchild.views.logout'),
    (r'^backend$', 'thunderchild.views.dashboard'),
    
    (r'^backend/media$', 'thunderchild.media_views.media'),
    (r'^backend/media/upload$', 'thunderchild.media_views.upload'),
    (r'^backend/media/replace$', 'thunderchild.media_views.replace'),
    (r'^backend/media/assets$', 'thunderchild.media_views.assets'),
    (r'^backend/media/assets/(\d+)$', 'thunderchild.media_views.edit_asset'),
    (r'^backend/media/chooser$', 'thunderchild.media_views.media_chooser'),
    
    (r'^backend/users$', 'thunderchild.views.users'),
    
    (r'^backend/field-groups$', 'thunderchild.field_views.fieldgroups'),
    (r'^backend/field-groups/create$', 'thunderchild.field_views.create_fieldgroup'),
    (r'^backend/field-groups/edit/(\d+)$', 'thunderchild.field_views.edit_fieldgroup'),
    (r'^backend/field-groups/delete$', 'thunderchild.field_views.delete_fieldgroup'),
    (r'^backend/field-groups/(\d+)/create$', 'thunderchild.field_views.create_field'),
    (r'^backend/field-groups/(\d+)/edit/(\d+)$', 'thunderchild.field_views.edit_field'),
    (r'^backend/field-groups/(\d+)/delete$', 'thunderchild.field_views.delete_field'),
    
    (r'^backend/category-groups$', 'thunderchild.category_views.categorygroups'),
    (r'^backend/category-groups/create$', 'thunderchild.category_views.create_categorygroup'),
    (r'^backend/category-groups/edit/(\d+)$', 'thunderchild.category_views.edit_categorygroup'),
    (r'^backend/category-groups/delete$', 'thunderchild.category_views.delete_categorygroup'),
    (r'^backend/category-groups/(\d+)/create$', 'thunderchild.category_views.create_category'),
    (r'^backend/category-groups/(\d+)/edit/(\d+)$', 'thunderchild.category_views.edit_category'),
    (r'^backend/category-groups/(\d+)/delete$', 'thunderchild.category_views.delete_category'),
    
    (r'^backend/entry-types$', 'thunderchild.entry_views.entrytypes'),
    (r'^backend/entry-types/create$', 'thunderchild.entry_views.create_entrytype'),
    (r'^backend/entry-types/edit/(\d+)$', 'thunderchild.entry_views.edit_entrytype'),
    (r'^backend/entry-types/delete$', 'thunderchild.entry_views.delete_entrytype'),
    (r'^backend/entries$', 'thunderchild.entry_views.entries'),
    (r'^backend/entries/create/(\d+)$', 'thunderchild.entry_views.create_entry'),
    (r'^backend/entries/edit/(\d+)$', 'thunderchild.entry_views.edit_entry'),
    (r'^backend/entries/delete$', 'thunderchild.entry_views.delete_entry'),
    
    (r'^backend/templates$', 'thunderchild.template_views.templates'),
    
    (r'^backend/api/templates/group$', 'thunderchild.template_views.group_create'),
    (r'^backend/api/templates/group/(\d+)$', 'thunderchild.template_views.group'),
    (r'^backend/api/templates/template$', 'thunderchild.template_views.template_create'),
    (r'^backend/api/templates/template/(\d+)$', 'thunderchild.template_views.template'),
    
    (r'^backend/forms/contact$', 'thunderchild.form_views.contactforms'),
    (r'^backend/forms/contact/create$', 'thunderchild.form_views.create_contactform'),
    (r'^backend/forms/contact/edit/(\d+)$', 'thunderchild.form_views.edit_contactform'),
    (r'^backend/forms/contact/process/(\d+)$', 'thunderchild.form_views.process_contactform'),
    (r'^backend/forms/contact/delete', 'thunderchild.form_views.delete_contactform'),
    
    (r'^backend/comments$', 'thunderchild.comment_views.comments'),
    (r'^backend/comments/submit$', 'thunderchild.comment_views.submit'),
    (r'^backend/comments/edit/(\d+)$', 'thunderchild.comment_views.edit'),
    (r'^backend/comments/delete$', 'thunderchild.comment_views.delete'),
    (r'^backend/comments/bulk-action$', 'thunderchild.comment_views.bulk_action'),
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