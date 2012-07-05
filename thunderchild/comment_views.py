from django.http import HttpResponseNotAllowed
from django.shortcuts import get_object_or_404, redirect, render
from thunderchild import models, model_forms
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse_lazy, reverse
from django.core.paginator import PageNotAnInteger, EmptyPage, Paginator


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def comments(request):
    comments = models.Comment.objects.all()
    
    paginator = Paginator(comments, 30)
    
    page = request.GET.get('page')
    try:
        p = paginator.page(page)
    except PageNotAnInteger:
        p = paginator.page(1)
    except EmptyPage:
        p = paginator.page(paginator.num_pages)
    
    return render(request, 'thunderchild/comments.html', {'comments':p})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def edit(request, comment_id):
    comment_model = get_object_or_404(models.Comment, pk=comment_id)
    if request.method == 'POST':
        form = model_forms.CommentModelForm(request.POST, instance=comment_model)
        if form.is_valid():
            form.save()
            return redirect('thunderchild.comment_views.comments')
        else:
            delete_url = reverse('thunderchild.comment_views.delete', args=[comment_id])
            return render(request, 'thunderchild/edit_comment.html', {'form':form, 
                                                                      'comment_id':comment_id,
                                                                      'delete_url':delete_url})
    else:
        delete_url = reverse('thunderchild.comment_views.delete', args=[comment_id])
        form = model_forms.CommentModelForm(instance=comment_model)
        return render(request, 'thunderchild/edit_comment.html', {'form':form,
                                                                  'comment_id':comment_id,
                                                                  'delete_url':delete_url})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def delete(request, comment_id):
    comment_model = get_object_or_404(models.Comment, pk=comment_id)
    comment_model.delete()
    return redirect('thunderchild.comment_views.comments')


def submit(request, entry_id):
    entry = get_object_or_404(models.Entry, pk=entry_id)
    if request.method == 'POST':
        form = entry.get_comment_form(request.POST)
        if form.is_valid():
            
            #TODO: Spam check here.
            
            site_settings = get_object_or_404(models.SiteSettings, id=settings.SITE_ID)
            
            comment = models.Comment(entry=entry, 
                                     name=form.cleaned_data['name'], 
                                     email=form.cleaned_data['email'], 
                                     website=form.cleaned_data['website'], 
                                     message=form.cleaned_data['message'],
                                     ip_address=request.META['REMOTE_ADDR'])
            comment.save()
            
            return redirect(site_settings.comment_success_url)
        else:
            return redirect(site_settings.comment_error_url)
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])
    