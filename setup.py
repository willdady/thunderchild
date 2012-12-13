#!/usr/bin/env python

from distutils.core import setup
from distutils.sysconfig import get_python_lib
import os

def get_file_list(directory):
      list = []
      for dirpath, dirnames, filenames in os.walk(directory):
            for filename in filenames:
                  list.append( os.path.normpath(os.path.join(dirpath, filename)) )
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
            (os.path.join(get_python_lib(), 'thunderchild/static'), get_file_list('thunderchild/static')),
            (os.path.join(get_python_lib(), 'thunderchild/fixtures'), get_file_list('thunderchild/fixtures')),
            (os.path.join(get_python_lib(), 'thunderchild/templates'), get_file_list('thunderchild/templates')),
      ],
     )
