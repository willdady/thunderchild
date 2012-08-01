import re

SPAM_WORDS = [
             'casino',
             'viagra',
             'nike',
             'ringtones',
             'roulette',
             'poker',
             'penis',
             'shoes',
             'paxil',
             'pharmacy',
             'gambling',
             'blackjack',
             'creditcard',
             'pills',
             'louisvuitton',
             'porn',
             'xanax',
             'xxx',
             ]

URL_WORDS = ['?', 'free']

class BodyTest():

    def spam_words(self, comment):
        count = 0
        for word in SPAM_WORDS:
            if word in comment['body']:
                count+=1
        return count

    def __call__(self, comment):
        score = 0
        # Count the number of links
        num_links = len(re.findall(r'<a +?href.*?< *?\/a *?>', comment['body']))
        if num_links >= 2:
            score -= num_links
        elif num_links < 2:
            score += 2
        # Test body length
        num_chars = len(comment['body'])
        if num_chars > 20 and num_links == 0:
            score += 2
        elif num_chars < 20:
            score -= 1
        # Count number of spam words
        num_spam_words = self.spam_words(comment)
        if num_spam_words > 0:
            score -= num_spam_words
        return score


class AuthorTest():

    def __call__(self, comment):
        if 'http://' in comment['name'] or 'https://' in comment['name']:
            return -2
        return 0


class URLTest():

    def url_words(self, comment):
        count = 0
        for word in URL_WORDS:
            if word in comment['website']:
                count+=1
        return count
    
    def __call__(self, comment):
        score = 0
        url_length = len(comment['website'])
        if url_length > 30:
            score -= 1
        score -= self.url_words(comment)
        return score


def get_spam_score(comment):
    '''
    Performs a series of tests on a comment and returns a score based on the likelihood of being spam. Values above 0 should be considered not-spam. Less than 0 should be marked as spam.
    Values less than -10 is HIGHLY likely to be spam.
    
    Expects a dictionary containing the following keys: name, website, body
    '''
    tests = [BodyTest(), AuthorTest(), URLTest()]
    score = 0
    for test in tests:
        score += test(comment)
    return score

