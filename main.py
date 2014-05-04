import os
import urllib
import ast
import json
import logging
from operator import attrgetter

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
        author = self.author.get().user.nickname()
        timestamp = self.timestamp.strftime('%b %d, \'%y')
        rating = len(self.up_votes) - len(self.down_votes)
        answer_key = self.key.urlsafe()
        return {'answer_key': answer_key, 'content': content, 'author': author, 'timestamp': timestamp, 'rating': rating}


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

def search(query):
    debug = ''
    SCORE_THRESHOLD = 2
    questions = Question.query()
    score_index = [0 for i in range(questions.count())]
    debug += 'query result length=' + str(questions.count())
    # tag score addition
    for q, i in zip(questions, range(len(score_index))):
        tags = (q.tags[0]).split(',')
        for tag in tags:
            if tag == query:
                score_index[i] = score_index[i] + 3
                debug += 'question: ' + q.question_title + ' has a matching tag of ' + tag + ': '

    # title score addition
    for q, i in zip(questions, range(len(score_index))):
        if q.question_title.lower().find(query) != -1:
            score_index[i] = score_index[i] + 5
            debug += 'question: ' + q.question_title + ' has a title substring of query: '

    # content score addition
    for q, i in zip(questions, range(len(score_index))):
        if q.question_content.lower().find(query) != -1:
            score_index[i] = score_index[i] + 2
            debug += 'question: ' + q.question_title + ' has a content substring of query: '

    debug += 'scores are: '
    # pick the top scorers
    top_scorers = []
    for q, i in zip(questions, range(len(score_index))):
        debug += str(score_index[i]) + ', '
        if score_index[i] > SCORE_THRESHOLD:
            top_scorers.append(q)


    # debug
    # return debug

    return top_scorers


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
        key_string = self.request.get('question_key') # AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
        if key_string != None and key_string != '':
            # retrieve the answers asscoiated with the question key
            question_key = ndb.Key(urlsafe=self.request.get('question_key'))
            ndb_answers = Answer.query(Answer.parent_question==question_key)
            answerList = []
            for a in ndb_answers:
                answerList.append(a.userFriendlyAnswer())

            # Sort the answers based on rating and send them back
            answerList = sorted(answerList, key=lambda x: x['rating'], reverse=True)
            answer_data = {'answers': answerList};
            self.response.write(json.dumps(answer_data))
        else:
            key_string = self.request.body
            if key_string != None and key_string != '':
                self.response.write('body: ' + key_string)
            else:
                # key_string = self.get_all
                self.response.write('failed get and body url: ' + str(self.request.url))


    def post(self):
        answer_data = ast.literal_eval(self.request.body)
        user_key = getUser(users.get_current_user()).key
        answer = Answer(parent_question=ndb.Key(urlsafe=answer_data['question_key']),
                        author=user_key,
                        answer_content=answer_data['content'],
                        up_votes=[],
                        down_votes=[])
        answer.put()
        self.response.write('added answer obj')


class AnswerVoteHandler(webapp2.RequestHandler):

    def post(self):
        user_key = getUser(users.get_current_user()).key
        answer_vote_data = ast.literal_eval(self.request.body)
        answer_key = answer_vote_data['answer_key']
        vote_status = answer_vote_data['vote_status']
        ndb_answer = ndb.Key(urlsafe=answer_key).get()

        for key in ndb_answer.up_votes:
            if key == user_key:
                self.response.write('WARNING: user already voted (up)')
                return

        for key in ndb_answer.down_votes:
            if key == user_key:
                self.response.write('WARNING: user already voted (down)')
                return

        remove_answer = False
        if vote_status == 'up':
            ndb_answer.up_votes.append(user_key)
            self.response.write('Python: up vote!')

        elif vote_status == 'down':
            self.response.write('Python: down vote!')
            ndb_answer.down_votes.append(user_key)

            # delete the answer if it is really bad
            if len(ndb_answer.down_votes) >= 2:
                ndb_answer.key.delete()
                self.response.write('delete the answer')
                remove_answer = True
        else:
            self.response.write('ERROR: invalid vote_status')

        if not remove_answer:
            ndb_answer.put()
        

class MainPageHandler(webapp2.RequestHandler):

    def get(self):
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

        # Remove questions that are too negatively rated
        for q in tmp:
            if len(q.down_votes) >= 2:
                q.key.delete()

        user_friendly_questions = UserFriendlyQuestionList(tmp)
        user_friendly_questions = trimContent(user_friendly_questions)

        debug1 = ''
        debug2 = 'debug2|'

        # Grabs the relevant posts to the user's query if 'query' parameter is in the url
        query = self.request.get('query')
        if query != None and query != '':
            # search fn call
            debug1 = 'search fired'
            question_obj_list = search(query)
            user_friendly_questions = UserFriendlyQuestionList(question_obj_list)
            # debug1 = search(query)


        template_values = {
            'user_name': user_name,
            'questions': user_friendly_questions,
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

class QuestionHandler(webapp2.RequestHandler):

    def get(self):
        question_key_string = self.request.get('question_key')
        if question_key_string != None and question_key_string != '':
            # Grabs the specified question info if 'question' parameter is in the url
            can_user_vote = False
            has_question_view = False
            question_obj = None
            user_friendly_question = None
            question_obj = ndb.Key(urlsafe=question_key_string).get()

            # Increment the view count
            question_obj.views = question_obj.views + 1
            question_obj.put()

            # Grab a more user friendly version of the data
            user_friendly_question = UserFriendlyQuestion(question_obj)
            has_question_view = True

            # Find out if user has voted on this question
            user = users.get_current_user()
            if user:
                can_user_vote = not (has_user_voted(getUser(user), question_obj))

            self.response.write(json.dumps({'current_question': 
                                              {'question_title': user_friendly_question.question_title,
                                               'question_content': user_friendly_question.question_content,
                                               'author_nickname': user_friendly_question.author_nickname,
                                               'formatted_timestamp': user_friendly_question.formatted_timestamp,
                                               'views': user_friendly_question.views,
                                               'key_string': user_friendly_question.key_string,
                                               'tags': user_friendly_question.tags
                                               },
                                            'can_user_vote': can_user_vote}))
            #test
            # self.response.write("  url: " + str(self.request.url))
        else:
            self.response.write("Error: no question string specified")



application = webapp2.WSGIApplication([
    ('/', MainPageHandler),
    ('/contributions', ContributionsPageHandler),
    ('/question_vote', QuestionVoteHandler),
    ('/answer', AnswerHandler),
    ('/answer_vote', AnswerVoteHandler),
    ('/question', QuestionHandler),
], debug=True)