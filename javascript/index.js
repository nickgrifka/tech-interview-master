function votePost(e)
{
   var question_key_string = e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML;
   var data = new Object();
   // Determine up or down
   if (e.target.className == 'up_vote')
   {
      data = {'question_key': question_key_string, 'vote_status': 'up'};
   }
   else
   {
      data = {'question_key': question_key_string, 'vote_status': 'down'};
   }

   // Make the vote box disappear
   e.target.parentNode.style.display = 'none';
   console.log(JSON.stringify(data))

   // Post
   $.ajax({
      type: 'POST',
      url: '/question_vote',
      data: JSON.stringify(data),
      success: function(data) {
         console.log('AJAX success!');
         console.log(data);
      }
   });
}


function getSolutions(e)
{
   console.log(e.target.parentNode.parentNode.className);
   var question_key_string = e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML;
   var data = new Object();
   data = {'question_key': question_key_string};

   $.ajax({
      type: 'GET',
      url: '/answer',
      data: data,
      success: function(response) {
         console.log('AJAX success!');
         console.log(response);
         console.log(JSON.parse(response));
         showAnswers(JSON.parse(response)['answers']);
      }
   });
}


function postSolution(e)
{
   var solutionString = document.getElementById('solution_content').value;
   console.log(e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0]);
   var question_key_string = e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML;
   var data = {'question_key': question_key_string, 'content': solutionString};

   console.log(JSON.stringify(data));

   $.ajax({
      type: 'POST',
      url: '/answer',
      data: JSON.stringify(data),
      success: function(response) {
         console.log('AJAX success!');
         console.log(response);
      }
   });
   closeSolutionPost(e);
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
   console.log('here');
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
   console.log(e.target.parentNode.parentNode.parentNode.parentNode.parentNode.className);
   var answer_key = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('answer_key')[0].innerHTML;
   var data = {'answer_key': answer_key, 'vote_status': status};

   console.log(JSON.stringify(data));

   $.ajax({
      type: 'POST',
      url: '/answer_vote',
      data: JSON.stringify(data),
      success: function(response) {
         console.log('AJAX sucessful');
         console.log(response);
      }
   })
}

function createAnswerElement(answer)
{
   var answerElement = document.createElement('li');
   answerElement.innerHTML = '<div class="answer_key">' + answer['answer_key'] + '</div><table class="answer_div"><tr><td class="vote_cell"><div class="up_vote">up</div><div class="answer_rating">' + answer['rating'] + '</div><div class="down_vote">down</div></td><td class="content_cell"><div class="answer_content">' + answer['content'] + '</div><div class="answer_meta">Answered by ' + answer['author'] + ' on ' + answer['timestamp'] + '</div></td></tr></table>';
   answerElement.getElementsByClassName('up_vote')[0].addEventListener('click', upVoteAnswer);
   answerElement.getElementsByClassName('down_vote')[0].addEventListener('click', downVoteAnswer);
   return answerElement;
}

function startSearch(query)
{
   console.log('search with query: ' + query);
   window.location = '/?query=' + query;
}

function getUrlParameter(sParam)
{
   var sPageURL = window.location.search.substring(1);
   var sURLVariables = sPageURL.split('&');
   for (var i = 0; i < sURLVariables.length; i++) 
   {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] == sParam) 
      {
         return sParameterName[1];
      }
   }
   return null;
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
      document.getElementById('viewer_solution_btn').addEventListener('click', getSolutions);
   }

   if (document.getElementById('viewer_solution_post_btn') != null)
   {
      document.getElementById('viewer_solution_post_btn').addEventListener('click', openSolutionPost);
   }

   $('#search').keypress(function(e) {
      if (e.keyCode == 13 && this.value != '')
      {
         startSearch(this.value.toLowerCase());
      }
   });

   // if user came from contributions, get current question
   var q = getUrlParameter('q');
   if (q != null)
   {
      grabQuestionInfo(q);
   }
}

$(document).ready(main);