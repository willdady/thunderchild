# Thunderchild

Thunderchild is a CMS solution built atop Django.

## Requirements

* [Django 1.4](https://www.djangoproject.com/)
* [Python Imaging Library](http://www.pythonware.com/products/pil/)

## Features

* Create your own entry types with custom fields to fit your data.
* Publish entires to templates using standard Django template tags. Create pretty URL's.
* Full cache support. Take advantage of Django's cache framework on a per-template basis.
* Built-in media manager for uploading files.
* Multiple user support (still work-in-progress).
* [Twitter Bootstrap](http://twitter.github.com/bootstrap/). Thunderchild uses this excellent front-end framework for rending it's own templates.

## Installation

As Thunderchild is a Django app, an understanding of creating a Django project is required. Be sure to [read Django's own tutorial](https://docs.djangoproject.com/en/dev/intro/tutorial01/) 
if you are new to Django or need a refresher. The following assumes you have setup a database on your environment and you are creating a NEW project for this installation.

1. Create your Django project.
2. Copy thunderchild folder to the root of your project (the directory containing *manage.py*).
3. Edit *settings.py* inside your project's main package to include your Database connection details. Include settings required by Thunderchild - See Settings section below.
4. Edit *urls.py* inside your project's main package to include Thunderchild's own *urls.py*. It is strongly recommended that Thunderchild is mounted at the root of your website as shown below. It must be
included as the last item.

	```
	from django.conf.urls import patterns, include
	
	urlpatterns = patterns('',
		# Other apps should go here.
	    (r'^', include('thunderchild.urls')),
	)
	```

5. From the root of your project run syncdb to have Django setup the required tables and fixtures in your database:

	```
	python manage.py syncdb
	```
    
6. If you are in a local development environment start the server with:

	```
	python manage.py runserver
	```
	
7. Assuming you mounted Thunderchild at the root of your website, you may now point your browser at localhost:8000/dashboard to login with the user you created in step 5.

## Settings

In addition to the default settings provided when creating a project with Django 1.4, Thunderchild requires the following:

1. If you are installing in a development environment you should set DEBUG = True and must also add INTERNAL_IPS = ('127.0.0.1',). Remember to set Debug = False if deploying to a production environment.
2. USE_TZ = True
3. Edit TEMPLATE_LOADERS to add 'thunderchild.loaders.TemplateLoader'as the last item in the tuple.
4. Add one of Django's [cached backends](https://docs.djangoproject.com/en/dev/topics/cache/). It is not a requirement to use a cache backend but will significantly reduced the number of database hits if you do. Eg.

	```
	CACHES = {
	    'default': {
	        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
	        'LOCATION': '/path/to/cache/directory',
	    }
	}
	```

5. Add 'django.core.context_processors.request' to the [TEMPLATE_CONTEXT_PROCESSORS](https://docs.djangoproject.com/en/dev/ref/settings/#template-context-processors) tuple. This allows access to the request object within templates.

	```
	TEMPLATE_CONTEXT_PROCESSORS = (
	    "django.contrib.auth.context_processors.auth",
	    "django.core.context_processors.request",
	    "django.core.context_processors.debug",
	    "django.core.context_processors.i18n",
	    "django.core.context_processors.media",
	    "django.core.context_processors.static",
	    "django.core.context_processors.tz",
	    "django.contrib.messages.context_processors.messages"
	)
	```
	
6. Edit INSTALLED_APPS to add 'thunderchild' as the last item in the tuple.

## Templates

### Context variables

Templates created by Thunderchild have the following variables automatically set in the context and are available in all templates.

#### segment_1, segment_2, segment_3 etc.

Each segment of the current URL. For example, if the URL is http://example.com/blog/archive/2012 you would have segment_1 = 'blog', segment_2 = 'archive', segment_3 = '2012'

#### last_segment

The last segment of the URL. In the above example segment_3 and last_segment would both equal '2012'. You would often use last_segment to retrive an Entry by it's slug.

### Template tags

Thunderchild comes with it's own set of template tags for retrieving entries from the system and rendering them. Thunderchild automatically adds the 
following [load tag](https://docs.djangoproject.com/en/1.4/ref/templates/builtins/#load) to new Templates.

	{% load thunderchild_tags %}
	
In order to use the following Thunderchild tags the above load tag *must* be present at the top of your template.

#### {% entry %}

Returns a single Entry by it's slug.

Usage:

	{% entry 'my-entry-slug' as my_entry %}
	
All Entry objects have the following attributes:

*id* - An integer. The entry's primary key, unique to each Entry.
*author* - The entry's author. A [User](https://docs.djangoproject.com/en/1.4/topics/auth/#users) object.  
*title* - The entry's title.  
*slug* - The entry's slug.  
*creation_date* - A datetime of when the entry was created.  
*last_modified_date* - A datetime of when the entry was last modified.  
*expiration_date* - A datetime of when the entry will expire.  
*is_published* - A Boolean of whether the entry is published. Will always return true as non-published entries will not render to templates.  
*categories* - A list of Categories the Entry is assigned to. See {% categories %} tag below.  
*comments_enabled* - A Boolean stating whether comments have been enabled for this entry.  
*comments_expiration_date* - A datetime of when comments will be considered closed.  

In addition to the above default fields, all custom fields are accessible by their short name. Field short names can be found at Admin/Field Groups.

#### {% entries %}

Performs a complex query returning a list of Entry objects matching the passed query parameters. The entries tag expects a single EntryType short name 
optionally followed by any of the following attributes:

*limit* - An integer denoting how many entries to limit the query to.  
*offset* - An integer to offset the results by. Combined with limit this is useful for paginated results.  
*order_by* - A comma-separated string of field names. Prefix a field name with '-' to reverse the order.  
*year* - An 4 digit integer specifying the year to filter the entries by.  
*month* - An integer specifying the month to filter the entries by. (1 = January, 12 = December).  
*day* - An integer specifying the day to filter the entries by.  
*categories* - A comma-separated string of Category short names to filter the results by.  

Usage:

	{% entries 'blog-entry' offset=2 limit=3 year=2012 order_by='-title, author' categories='news, fun' as blog_entries %}
	
The above example would store the query result in blog_entries which can be iterated over with a standard [for tag](https://docs.djangoproject.com/en/1.4/ref/templates/builtins/#for).
	
#### {% categories %}

Returns a list of Category objects belonging to the CategoryGroup. Expects a single parameter, a CategoryGroup short name.

Usage:

	{% categories 'my_category_group' as my_category_group %}	

Category objects have the following attributes:

*category_name* - The Category's name.  
*category_short_name* - The Category's short name.  
	
#### {% template_url %}

Returns a URL for a template. A single string parameter is expected in the format "<template group>/<template name>".

Usage:

	{% template_url "staff/all" %}

## Comments

Thunderchild includes 2 template snippets to help rending comments in your template. They are "thunderchild/snippets/comment_form.html" for rending a comment submission form 
and "thunderchild/snippets/comments.html" for rendering the (approved) comments for an Entry. Both snippets have classes set in their markup for styling but feel free to edit 
these files if the markup is not to your liking. Each snippet can be included in your template using Django's standard 
[include tag](https://docs.djangoproject.com/en/dev/ref/templates/builtins/?from=olddocs#include) and requires an Entry be passed via the entry variable.

Example:

	```
	{% entry 'my-entry' as my_entry %}
	
	{% include "thunderchild/snippets/comments.html" with entry=my_entry %}
	
	{% include "thunderchild/snippets/comment_form.html" with entry=my_entry %}
	```
	
By default the comment form will redirect users to "/comment/thankyou" on success and "/comment/error"	if there is an error processing the form (such as an invalid email address). Be sure
to create templates at these locations. Alternatively, you may set the success and error URL's explicitly.

Example:

	{% include "thunderchild/snippets/comment_form.html" with entry=my_entry success_url="/my/custom/success/url" error_url="/my/custom/error/url" %}
	
	
