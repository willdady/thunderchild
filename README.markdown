# Thunderchild

Thunderchild is a turn-key CMS solution built atop Django. It is inspired by ExpressionEngine by EllisLab.

## Requirements

[Django 1.4](https://www.djangoproject.com/)

[Python Imaging Library](http://www.pythonware.com/products/pil/)

## Features

* Create your own entry types with custom fields to fit your data. No being boxed into a fixed schema.
* Publish entires to templates using standard Django template tags. Create pretty URL's.
* Full cache support. Take advantage of Django's cache framework on a per-template basis.
* Built-in media manager for uploading files.
* Multiple user support (still work-in-progress).
* [Twitter Bootstrap](http://twitter.github.com/bootstrap/). Thunderchild uses this excellent front-end framework for rending it's own templates.

## Installation

As Thunderchild is a Django app, an understanding of creating a Django project is required. Be sure to [read Django's own tutorial](https://docs.djangoproject.com/en/dev/intro/tutorial01/) 
if you are new to Django or need a refresher. The following assumes you have setup a database on your environment and you are creating a NEW project for this installation.

1. Create your Django project.
2. Copy thunderchild folder to the root of your project (the directory containing manage.py).
3. Edit settings.py inside your project's main package to include your Database connection details. Include settings required by Thunderchild - See Settings section below.
4. Edit urls.py inside your project's main package to include Thunderchild's own urls.py. It is strongly recommended Thunderchild is mounted at the root of your website as shown below. It must be
included as the last item.

	from django.conf.urls import patterns, include
	
	urlpatterns = patterns('',
		# Other apps should go here.
	    (r'^', include('thunderchild.urls')),
	)

5. From the root of your project run syncdb to have Django setup the required tables and fixtures in your database:

    python manage.py syncdb
    
6. If you are in a local development environment start the server with:

	python manage.py runserver
	
7. Assuming you mounted Thunderchild at the root of your website, you may now point your browser at localhost:8000/backend to login with the user you created in step 5.

## Settings

In addition to the default settings provided when creating a project with Django 1.4, Thunderchild requires the following:

1. Edit INSTALLED_APPS to add 'thunderchild' as the last item in the tuple.
2. USE_TZ = True
3. Edit TEMPLATE_LOADERS to add 'thunderchild.loaders.TemplateLoader'as the last item in the tuple.
4. If you are installing in a development environment you should set DEBUG = True and must also add INTERNAL_IPS = ('127.0.0.1',). Remember to set Debug = False if deploying to a production environment.




