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

# class Greeting(ndb.Model):
#     """Models an individual Guestbook entry with author, content, and date."""
#     author = ndb.UserProperty()
#     content = ndb.StringProperty(indexed=False)
#     date = ndb.DateTimeProperty(auto_now_add=True)


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


def getUser(usr):
    return UserAccount.query().filter(UserAccount.user==usr).get()


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

        template_values = {
            'user_name': user_name
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
            if not getUser(user):
                userAccount = UserAccount(user=user)
                userAccount.put()

            template_values = {}
            # Fetch the user's previous posts
            # TODO

            template_values = {
                'user_name': user.nickname()
            }
            template = JINJA_ENVIRONMENT.get_template('contributions.html')
            self.response.write(template.render(template_values))


class PostHandler(webapp2.RequestHandler):

    def post(self):
        user = users.get_current_user()
        question = Question(author=getUser(user).key,
                            question_title=self.request.get('question_title'),
                            question_content=self.request.get('question_content'),
                            views=0,
                            authenticity=0,
                            tags=self.request.get_all('tags'))
        question.put()
        # self.redirect('/');

        # Test page
        template_values = {
            'author': question.author,
            'question_title': question.question_title,
            'question_content': question.question_content,
            'views': question.views,
            'authenticity': question.authenticity,
            'tags': question.tags,
        }

        template = JINJA_ENVIRONMENT.get_template('testDb.html')
        self.response.write(template.render(template_values))

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