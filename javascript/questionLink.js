
function main()
{
   // Set on click listener for the tag results
   //
   document.getElementById('userContributions').addEventListener('click', function(e) {
      var keyString = e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML;
      var tag_list = document.getElementById('viewer_tag_list');
      if (tag_list != null)
      {
         tag_list.innerHTML = '';
      }
      redirect('question=' + keyString)
   });
}

$(document).ready(main);


function redirect(postData)
{
   var url = '';
   if (upVotes.length > 0 || downVotes.length > 0)
   {
      console.log('do post');
      url = '/?' + postData;
      loadVotePostData(url);
   }
   else
   {
      console.log('do get');
      url = '/?' + postData;
   }

   window.location = url;
}