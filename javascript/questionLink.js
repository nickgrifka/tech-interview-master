function grabQuestionInfo(keyString)
{
   var tag_list = document.getElementById('viewer_tag_list');
   if (tag_list != null)
   {
      tag_list.innerHTML = '';
   }

   var data = new Object();
   data = {'question_key': keyString};

   $.ajax({
      type: 'GET',
      url: '/question',
      data: data,
      success: function(response) {
         console.log('AJAX success!');
         var obj = new Object()
         obj = JSON.parse(response)
         showQuestion(obj.current_question, obj.can_user_vote);
      }
   });
}

function showQuestion(questionObj, canVote)
{
   document.getElementsByClassName('viewer_title')[0].innerHTML = questionObj.question_title;
   document.getElementsByClassName('viewer_views')[0].innerHTML = questionObj.views + ' views';
   document.getElementsByClassName('viewer_content')[0].innerHTML = questionObj.question_content;
   document.getElementsByClassName('viewer_publishinfo')[0].innerHTML = 'Posted by ' + questionObj.author_nickname + ' at ' + questionObj.formatted_timestamp;
   document.getElementById('question_view_container').getElementsByClassName('hiddenQuestionInfo')[0].innerHTML = questionObj.key_string;

   // tags
   var tagListElement = document.getElementById('viewer_tag_list');
   for (var i = 0; i < questionObj.tags.length; i++)
   {
     var listItemElement = document.createElement('li');
     listItemElement.addEventListener('click', tagClick);
     listItemElement.innerHTML = questionObj.tags[i];
     tagListElement.appendChild(listItemElement);
   }

   // user question vote
   document.getElementById('viewer_vote').style.display = 'block';
   if (!canVote)
   {
     document.getElementById('viewer_vote').style.display = 'none';
   }

   // answers
   document.getElementById('answer_viewer').style.display = 'none';
   if (document.getElementById('viewer_solution_btn') != null)
   {
     document.getElementById('viewer_solution_btn').innerHTML = 'view solutions';
   }

   // document.getElementsByClassName('question_viewer')[0].style.display = 'block';
   document.getElementById('question_view_container').style.display = 'block';
}

function getQuestion(e)
{
   var questionId = e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML;
   var currentQuestionId = document.getElementById('question_view_container').getElementsByClassName('hiddenQuestionInfo')[0].innerHTML;
   if (questionId != currentQuestionId)
   {
      grabQuestionInfo(questionId);
   }
}


function main()
{
   // Set on click listener for the tag results
   document.getElementById('userContributions').addEventListener('click', getQuestion);
}

$(document).ready(main);
