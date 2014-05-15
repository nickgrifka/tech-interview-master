QUESTION_URL_PARAMETER = 'q';
QUERY_URL_PARAMETER = 'query';

function votePost(e)
{
   var question_key_string = e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML;
   var data = new Object();
   // Determine up or down
   if (e.target.id == 'up_vote')
   {
      data = {'question_key': question_key_string, 'vote_status': 'up'};
   }
   else
   {
      data = {'question_key': question_key_string, 'vote_status': 'down'};
   }

   // Make the vote box disappear
   e.target.parentNode.style.display = 'none';

   // Post
   $.ajax({
      type: 'POST',
      url: '/question_vote',
      data: JSON.stringify(data),
      success: function(data) {
         console.log('AJAX success!');
      }
   });
}


function getSolutions(e)
{
   var question_key_string = e.target.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML;
   var data = new Object();
   data = {'question_key': question_key_string};

   $.ajax({
      type: 'GET',
      url: '/answer',
      data: data,
      success: function(response) {
         console.log('AJAX success!');
         showAnswers(JSON.parse(response)['answers']);
      }
   });
}


function postSolution(e)
{
   var solutionString = document.getElementById('solution_content').value;
   var question_key_string = e.target.parentNode.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML;
   var data = new Object();
   data = {'question_key': question_key_string, 'content': solutionString};

   $.ajax({
      type: 'POST',
      url: '/answer',
      data: JSON.stringify(data),
      success: function(response) {
         console.log('AJAX success!');
      }
   });
   closeSolutionPost(e);
}

function toggleSolutions(e)
{
   if (document.getElementById('answer_viewer').style.display == 'none')
   {
      // console.log('display is: ' + document.getElementById('answer_viewer').style.display);
      document.getElementById('viewer_solution_btn').innerHTML = 'hide solutions';
      getSolutions(e);
   }
   else
   {
      // console.log('display is: ' + document.getElementById('answer_viewer').style.display);
      document.getElementById('viewer_solution_btn').innerHTML = 'view solutions';
      document.getElementById('answer_viewer').style.display = 'none';
   }
}

function closeSolutionPost()
{
   document.getElementById('solution_edit').style.display = 'none';
   document.getElementById('solution_content').value = '';
}

function openSolutionPost()
{
   document.getElementById('solution_edit').style.display = 'block';
   document.getElementById('post_solution_btn').addEventListener('click', postSolution);
   document.getElementById('post_solution_cancel_btn').addEventListener('click', closeSolutionPost);
}

function showAnswers(answersList)
{
   var answerList = document.getElementById('answer_viewer');
   answerList.innerHTML = '';
   answerList.style.display = 'block';
   for (var i = 0; i < answersList.length; i++)
   {
      var answerElement = createAnswerElement(answersList[i]);
      answerList.appendChild(answerElement);
   }
}

function upVoteAnswer(e)
{
   voteAnswer(e, 'up');
}

function downVoteAnswer(e)
{
   voteAnswer(e, 'down');
}

function voteAnswer(e, status)
{
   var answer_key = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('answer_key')[0].innerHTML;
   var data = {'answer_key': answer_key, 'vote_status': status};

   $.ajax({
      type: 'POST',
      url: '/answer_vote',
      data: JSON.stringify(data),
      success: function(response) {
         console.log('AJAX sucessful');
      }
   })
}

function createAnswerElement(answer)
{
   var answerElement = document.createElement('li');
   answerElement.className += 'answer_list_elt'
   answerElement.innerHTML = '<div class="answer_key">' + answer['answer_key'] + '</div><table class="answer_div"><tr><td class="vote_cell"><div class="answer_up_vote"></div><div class="answer_rating">' + answer['rating'] + '</div><div class="answer_down_vote"></div></td><td class="content_cell"><div class="answer_content">' + answer['content'] + '</div><div class="answer_meta">' + answer['author'] + ' on ' + answer['timestamp'] + '</div></td></tr></table>';
   answerElement.getElementsByClassName('answer_up_vote')[0].addEventListener('click', upVoteAnswer);
   answerElement.getElementsByClassName('answer_down_vote')[0].addEventListener('click', downVoteAnswer);
   return answerElement;
}

function tagClick(e)
{
   var tag_contents = e.target.innerHTML;
   document.getElementById('search').value = tag_contents;
   startSearch(tag_contents);
}

function startSearch(query)
{
   window.location = '/?' + QUERY_URL_PARAMETER + '=' + query;
}

function refresh()
{
   window.location = '/';
}


function main()
{
   // Set event listener to viewer voting box
   if (document.getElementById('viewer_vote') != null)
   {
      document.getElementById('viewer_vote').addEventListener('click', votePost);
   }

   if (document.getElementById('viewer_solution_btn') != null)
   {
      document.getElementById('viewer_solution_btn').addEventListener('click', toggleSolutions);
   }

   if (document.getElementById('viewer_solution_post_btn') != null)
   {
      document.getElementById('viewer_solution_post_btn').addEventListener('click', openSolutionPost);
   }

   document.getElementById('refresh').addEventListener('click', refresh);

   $('#search').keypress(function(e) {
      if (e.keyCode == 13 && this.value != '')
      {
         startSearch(this.value.toLowerCase());
      }
   });

   // if user came from contributions, get current question
   var q = getUrlParameter(QUESTION_URL_PARAMETER);
   if (q != null)
   {
      grabQuestionInfo(q);
   }

   // if user performed a search, put the query string back in the search input
   var query = getUrlParameter(QUERY_URL_PARAMETER);
   if (query != null)
   {
      query = query.replace('%20', ' ');
      document.getElementById('search').value = query;
   }

   // Check to see if search was unsuccessful
   if (document.getElementsByClassName('questionListItem')[0] == null)
   {
      document.getElementById('no_results').style.display = "block";
   }
}

$(document).ready(main);