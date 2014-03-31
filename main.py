import os
import urllib

from google.appengine.api import users
from google.appengine.ext import ndb

import jinja2
import webapp2


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

# jinja_environment = jinja2.Environment(loader=
#     jinja2.FileSystemLoader(os.path.dirname(__file__)))


class UserAccount(ndb.Model):
    user = ndb.UserProperty()

class Question(ndb.Model):
    author = ndb.KeyProperty(UserAccount)
    question_title = ndb.StringProperty()
    question_content = ndb.StringProperty()
    views = ndb.IntegerProperty()
    authenticity = ndb.IntegerProperty()
    tags = ndb.StringProperty(repeated=True)
    timestamp = ndb.DateTimeProperty(auto_now_add=True)

# WARNING!! The code uses the same instance for everything! accumulates tags!
class UserFriendlyQuestion():
    question_title = ''
    question_content = ''
    author_nickname = ''
    views = 0
    authenticity = 0
    formatted_timestamp = ''
    tags = []
    key_string = ''

    def __init__(self, ndb_question):
        self.question_title = ndb_question.question_title
        self.question_content = ndb_question.question_content
        self.author_nickname = ndb_question.author.get().user.nickname()
        self.views = ndb_question.views
        self.authenticity = ndb_question.authenticity
        self.formatted_timestamp = ndb_question.timestamp.strftime('%b %d, \'%y')
        self.key_string = ndb_question.key.urlsafe()
        self.tags = []
        temp_tag_list = str(ndb_question.tags[0]).split(',')
        for t in temp_tag_list:
            self.tags.append(t)

def UserFriendlyQuestionList(ndb_question_list):
    user_friendly_question_list = []
    for q in ndb_question_list:
        user_friendly_question_list.append(UserFriendlyQuestion(q))
    return user_friendly_question_list


def getUser(usr):
    return UserAccount.query().filter(UserAccount.user==usr).get()

def trimContent(questions):
    for q in questions:
        if len(q.question_content) > 62:
            q.question_content = q.question_content[:62] + ' ...'
    return questions


class MainPageHandler(webapp2.RequestHandler):

    def get(self):
        template_values = {}

        # Grab the users name to display
        user_name = ''
        user = users.get_current_user()
        if user:
            user_name = user.nickname()
        else:
            user_name = 'random user'

        tmp = Question.query().order(-Question.timestamp)
        user_friendly_questions = UserFriendlyQuestionList(tmp)
        user_friendly_questions = trimContent(user_friendly_questions)

        debug1 = ''
        debug2 = 'debug2|'

        # Grabs the specified question info if 'question' parameter is in the url
        has_question_view = False
        question_obj = None
        user_friendly_question = None
        question_key_string = self.request.get('question')
        if question_key_string != None and question_key_string != '':
            question_obj = ndb.Key(urlsafe=question_key_string).get()

            # Increment the view count
            question_obj.views = question_obj.views + 1
            question_obj.put()

            # Grab a more user friendly version of the data
            user_friendly_question = UserFriendlyQuestion(question_obj)
            has_question_view = True

        template_values = {
            'user_name': user_name,
            'questions': user_friendly_questions,
            'has_question_view': has_question_view,
            'current_question': user_friendly_question,
            'debug1': debug1,
            'debug2': debug2,
        }
        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(template_values))


class ContributionsPageHandler(webapp2.RequestHandler):

    def get(self):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))
        else:
            # Add the user if he/she is not already in the db
            userAccount = getUser(user)
            if not userAccount:
                userAccount = UserAccount(user=user)
                userAccount.put()

            # Fetch the user's previous posts
            tmp = Question.query(Question.author==userAccount.key).order(-Question.timestamp)
            user_friendly_questions = UserFriendlyQuestionList(tmp)
            user_friendly_questions = trimContent(user_friendly_questions)

            template_values = {
                'user_name': user.nickname(),
                'questions': user_friendly_questions,
            }
            template = JINJA_ENVIRONMENT.get_template('contributions.html')
            self.response.write(template.render(template_values))


class PostHandler(webapp2.RequestHandler):

    def post(self):
        # tag_string = 
        # tags = tag_string.split()
        
        user = users.get_current_user()
        question = Question(author=getUser(user).key,
                            question_title=self.request.get('question_title'),
                            question_content=self.request.get('question_content'),
                            views=0,
                            authenticity=0,
                            tags=self.request.get_all('tags'))
        question.put()
        self.redirect('/contributions');

        # Test page
        # template_values = {
        #     'author': question.author,
        #     'question_title': question.question_title,
        #     'question_content': question.question_content,
        #     'views': question.views,
        #     'authenticity': question.authenticity,
        #     'tags': question.tags,
        # }

        # template = JINJA_ENVIRONMENT.get_template('testDb.html')
        # self.response.write(template.render(template_values))

class TestDbHandler(webapp2.RequestHandler):

    def get(self):
        template = JINJA_ENVIRONMENT.get_template('contributions.html')
        self.response.write(template.render(template_values))

application = webapp2.WSGIApplication([
    ('/', MainPageHandler),
    ('/contributions', ContributionsPageHandler),
    ('/contributions/post', PostHandler),
    ('/testDb', TestDbHandler),
], debug=True)