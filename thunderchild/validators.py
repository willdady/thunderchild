from django.core.validators import RegexValidator
import re

lowercase_re = re.compile(r'^[^A-Z]*$')
validate_lowercase = RegexValidator(lowercase_re, "Field must contain lowercase characters only.")

urlchars_re = re.compile(r'^[a-z0-9-_$.+]*$')
validate_urlchars = RegexValidator(urlchars_re, "Value must contain only letters, numbers and/or the special characters -, _, $, ., +.")

#color_re = re.compile(r'^#[0-9a-fA-F]{6}$')
#validate_color = RegexValidator(color_re, message="Value must be a valid hexadecimal value. eg. #0f7ac4.")