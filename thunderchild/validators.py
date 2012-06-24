from django.core.validators import RegexValidator
import re

lowercase_re = re.compile(r'^[^A-Z]*$')
validate_lowercase = RegexValidator(lowercase_re, "Field must contain lowercase characters only.", 'invalid')

urlchars_re = re.compile(r'^[a-z0-9-_$.+]*$')
validate_urlchars = RegexValidator(urlchars_re, "Value must contain only letters, numbers and/or the special characters -, _, $, ., +.", 'invalid')