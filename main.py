import os
import urllib
import ast
import json

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
    up_votes = ndb.KeyProperty(UserAccount, repeated=True)
    down_votes = ndb.KeyProperty(UserAccount, repeated=True)
    tags = ndb.StringProperty(repeated=True)
    timestamp = ndb.DateTimeProperty(auto_now_add=True)

class Answer(ndb.Model):
    parent_question = ndb.KeyProperty(Question)
    author = ndb.KeyProperty(UserAccount)
    answer_content = ndb.StringProperty()
    up_votes = ndb.KeyProperty(UserAccount, repeated=True)
    down_votes = ndb.KeyProperty(UserAccount, repeated=True)
    timestamp = ndb.DateTimeProperty(auto_now_add=True)

    def userFriendlyAnswer(self):
        content = self.answer_content
        # author = UserAccount(self.author).user.nickname()
        # timestamp = self.timestamp.strftime('%b %d, \'%y')
        # rating = len(self.up_votes) - len(self.down_votes)
        return {'content': content}#, 'author': author, 'timestamp': timestamp, 'rating': rating}


# WARNING!! The code uses the same instance for everything! accumulates tags!
class UserFriendlyQuestion():
    question_title = ''
    question_content = ''
    author_nickname = ''
    views = 0
    formatted_timestamp = ''
    tags = []
    key_string = ''

    def __init__(self, ndb_question):
        self.question_title = ndb_question.question_title
        self.question_content = ndb_question.question_content
        self.author_nickname = ndb_question.author.get().user.nickname()
        self.views = ndb_question.views
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

def has_user_voted(ndb_user, ndb_question):
    for up in ndb_question.up_votes:
        if up == ndb_user.key:
            return True
    for down in ndb_question.down_votes:
        if down == ndb_user.key:
            return True
    return False


class QuestionVoteHandler(webapp2.RequestHandler):

    def post(self):
        vote_data_string = self.request.body
        ndb_q = None
        if vote_data_string:
            vote_data = ast.literal_eval(vote_data_string)
            user_key = getUser(users.get_current_user()).key
            ndb_q = ndb.Key(urlsafe=str(vote_data['question_key'])).get()
     
            if vote_data['vote_status'] == 'up':
                ndb_q.up_votes.append(user_key)
            elif vote_data['vote_status'] == 'down':
                ndb_q.down_votes.append(user_key)
            else:
                self.response.write('vote status neither up or down')

        if ndb_q:
            ndb_q.put()
            self.response.write('put the qustion obj')
        self.response.write('Done!')


class AnswerHandler(webapp2.RequestHandler):

    def get(self):
        #TODO
        question_key = ndb.Key(urlsafe=self.request.get('question_key'))
        ndb_answers = Answer.query(Answer.parent_question==question_key)
        answerList = []
        for a in ndb_answers:
            answerList.append(a.userFriendlyAnswer())

        self.response.write(str(answerList)) #answer_string)


    def post(self):
        #TODO
        answer_data = ast.literal_eval(self.request.body)
        user_key = getUser(users.get_current_user()).key
        answer = Answer(parent_question=ndb.Key(urlsafe=answer_data['question_key']),
                        author=user_key,
                        answer_content=answer_data['content'],
                        up_votes=[],
                        down_votes=[])
        answer.put()
        self.response.write('added answer obj')



class MainPageHandler(webapp2.RequestHandler):

    def get(self):
        # self.response.write('message from get')
        self.loadPage("from get")

    

    def loadPage(self, debugParam):
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
        user_has_voted = False
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

            # Find out if user has voted on this question
            if user:
                user_has_voted = has_user_voted(getUser(user), question_obj)


        template_values = {
            'user_name': user_name,
            'questions': user_friendly_questions,
            'has_question_view': has_question_view,
            'current_question': user_friendly_question,
            'user_has_voted': user_has_voted,
            'debug1': debug1,
            'debug2': debugParam,
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

    def post(self):        
        user = users.get_current_user()
        question = Question(author=getUser(user).key,
                            question_title=self.request.get('question_title'),
                            question_content=self.request.get('question_content'),
                            views=0,
                            # add up vote and down vote init
                            up_votes=[], #init with this? getUser(user).key
                            down_votes = [], #init with this? getUser(user).key
                            tags=self.request.get_all('tags'))
        question.put()
        self.redirect('/contributions');



application = webapp2.WSGIApplication([
    ('/', MainPageHandler),
    ('/contributions', ContributionsPageHandler),
    ('/question_vote', QuestionVoteHandler),
    ('/answer', AnswerHandler),
], debug=True)