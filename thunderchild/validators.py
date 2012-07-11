from django.core.validators import RegexValidator
import re
from django.core.exceptions import ValidationError

lowercase_re = re.compile(r'^[^A-Z]*$')
validate_lowercase = RegexValidator(lowercase_re, "Field must contain lowercase characters only.")


urlchars_re = re.compile(r'^[a-z0-9-_$.+]*$')
validate_urlchars = RegexValidator(urlchars_re, "Value must contain only letters, numbers and/or the special characters -, _, $, ., +.")


def validate_color(value):
    color_re = re.compile(r'^#[0-9a-fA-F]{6}$')
    if not color_re.search(value):
        raise ValidationError(u'Value must be a valid hexadecimal value. eg. #0f7ac4.')