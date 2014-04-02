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
      url: '/',
      data: JSON.stringify(data),
      success: function(data) {
         console.log('AJAX success!');
         console.log(data);
      }
   });
}


function main()
{
   // Set event listener to viewer voting box
   if (document.getElementById('viewer_vote') != null)
   {
      document.getElementById('viewer_vote').addEventListener('click', votePost);
   }
}

$(document).ready(main);