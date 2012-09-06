from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.core.urlresolvers import reverse_lazy, reverse
from django.http import HttpResponseNotAllowed
from django.shortcuts import render, redirect, get_object_or_404
from smtplib import SMTPException
from thunderchild import model_forms, models

@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def contactforms(request):
    contactforms = models.ContactForm.objects.all()
    
    paginator = Paginator(contactforms, 30)
    
    page = request.GET.get('page')
    try:
        p = paginator.page(page)
    except PageNotAnInteger:
        p = paginator.page(1)
    except EmptyPage:
        p = paginator.page(paginator.num_pages)
    
    return render(request, 'thunderchild/contactforms.html', {'contactforms':p})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def create_contactform(request):
    if request.method == 'POST':
        form = model_forms.ContactFormForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('thunderchild.form_views.contactforms')
        else:
            return render(request, 'thunderchild/create_contactform.html', {'form':form})
    else:
        form = model_forms.ContactFormForm()
        return render(request, 'thunderchild/create_contactform.html', {'form':form})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def edit_contactform(request, contactform_id):
    model = get_object_or_404(models.ContactForm, pk=contactform_id)
    if request.method == 'POST':
        form = model_forms.ContactFormForm(request.POST, instance=model)
        if form.is_valid():
            form.save()
            return redirect('thunderchild.form_views.contactforms')
        else:
            return render(request, 'thunderchild/edit_contactform.html', {'form':form, 
                                                                          'contactform_id':contactform_id,
                                                                          'delete_url':reverse('thunderchild.form_views.delete_contactform')})
    else:
        form = model_forms.ContactFormForm(instance=model)
        return render(request, 'thunderchild/edit_contactform.html', {'form':form, 
                                                                      'contactform_id':contactform_id,
                                                                      'delete_url':reverse('thunderchild.form_views.delete_contactform')})
    
    
@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def delete_contactform(request):    
    if request.method == 'POST':
        models.ContactForm.objects.filter(pk=request.POST['id']).delete()
        return redirect('thunderchild.form_views.contactforms')
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])
    
    
def process_contactform(request, contactform_id):
    model = get_object_or_404(models.ContactForm, pk=contactform_id)
    if request.method == 'POST':
        form = model.get_form(request.POST)
        if form.is_valid():
            
            from_email = form.cleaned_data['email']
            subject = form.cleaned_data['subject']
            message = "From: {}\n\nMessage:\n{}".format(from_email, form.cleaned_data['message'])
            recipient_list = model.get_recipient_list()
            
            try:
                send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            except SMTPException:
                return redirect(model.error_url)
            
            return redirect(model.success_url)
        else:
            return redirect(model.error_url)
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])
    
    
    