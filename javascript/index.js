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
      }
   });
}


function postSolution(e)
{
   closeSolutionPost(e);
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
}

function closeSolutionPost()
{
   document.getElementById('solution_edit').style.display = 'none';
}

function openSolutionPost()
{
   document.getElementById('solution_edit').style.display = 'block';
   document.getElementById('post_solution_btn').addEventListener('click', postSolution);
   document.getElementById('post_solution_cancel_btn').addEventListener('click', closeSolutionPost);
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
}

$(document).ready(main);