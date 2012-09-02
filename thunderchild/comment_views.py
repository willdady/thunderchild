from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.paginator import PageNotAnInteger, EmptyPage, Paginator
from django.core.urlresolvers import reverse_lazy, reverse
from django.http import HttpResponseNotAllowed, HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, render
from thunderchild import models, model_forms
from thunderchild.spam import get_spam_score


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def comments(request):
    comments = models.Comment.objects.all().order_by('-date')
    
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
            delete_url = reverse('thunderchild.comment_views.delete')
            return render(request, 'thunderchild/edit_comment.html', {'form':form, 
                                                                      'comment_id':comment_id,
                                                                      'delete_url':delete_url})
    else:
        delete_url = reverse('thunderchild.comment_views.delete')
        form = model_forms.CommentModelForm(instance=comment_model)
        return render(request, 'thunderchild/edit_comment.html', {'form':form,
                                                                  'comment_id':comment_id,
                                                                  'delete_url':delete_url})


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def delete(request):
    if request.method == 'POST':
        models.Comment.objects.filter(pk=request.POST['id']).delete()
        return redirect('thunderchild.comment_views.comments')
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])


@login_required(login_url=reverse_lazy('thunderchild.views.login'))
def bulk_action(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        comments = request.POST.getlist('comment')
        
        if action == None or comments == None:
            return redirect('thunderchild.comment_views.comments')
        
        if action == 'delete':
            for comment_id in comments:
                models.Comment.objects.filter(id__exact=comment_id).delete()
        elif action == 'approve' or action == 'unapprove':
            for comment_id in comments:
                try:
                    comment = models.Comment.objects.get(pk=comment_id)
                except models.Comment.DoesNotExist:
                    continue
                comment.is_approved = action == 'approve'
                comment.save()
            
        return redirect('thunderchild.comment_views.comments')
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])


def submit(request):
    if request.method == 'POST':
        entry = get_object_or_404(models.Entry, pk=request.POST['entry_id'])
        form = entry.get_comment_form(request.POST)
        if form.is_valid():
            comment = models.Comment(entry=entry, 
                                     name=form.cleaned_data['name'], 
                                     email=form.cleaned_data['email'], 
                                     website=form.cleaned_data['website'], 
                                     body=form.cleaned_data['body'],
                                     ip_address=request.META['REMOTE_ADDR'])
            # Get the spam score. Scores < 0 will be marked as spam. Scores <= -10 will NOT saved, the user/spammer will still be redirected to the success/awaiting moderation page.
            spam_score = get_spam_score(form.cleaned_data)
            if spam_score < 0:
                comment.is_spam = True
            if spam_score <= -10:
                return redirect(request.POST['success'])
            # Save comment
            comment.save()
            return redirect(request.POST['success'])
        else:
            return redirect(request.POST['error'])
    else:
        return HttpResponseNotAllowed(permitted_methods=['POST'])
    