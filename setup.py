#!/usr/bin/env python

from distutils.core import setup
import os

def get_file_list(directory):
      list = []
      for dirpath, dirnames, filenames in os.walk(directory):
            for filename in filenames:
                  list.append( os.path.join(dirpath, filename) )
      return list

setup(name='Thunderchild',
      version='1.0',
      description='A standalone CMS built atop Django.',
      author='Will Dady',
      author_email='will@williamdady.com',
      url='https://github.com/willdady/thunderchild',
      packages=['thunderchild', 'thunderchild.templatetags'],
      requires=[
      	'django(>=1.4)',
      	'pil(>=1.1.7)'
      ],
      data_files=[
      	('thunderchild/static/', get_file_list('thunderchild/static/')),
            ('thunderchild/fixtures/', get_file_list('thunderchild/fixtures/')),
            ('thunderchild/templates/', get_file_list('thunderchild/templates/')),
      ],
     )