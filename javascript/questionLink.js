function showQuestion(e)
{
   var keyString = e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML;
   var tag_list = document.getElementById('viewer_tag_list');
   if (tag_list != null)
   {
      tag_list.innerHTML = '';
   }
   window.location = '/?question=' + keyString; 
}


function main()
{
   // Set on click listener for the tag results
   document.getElementById('userContributions').addEventListener('click', showQuestion);
}

$(document).ready(main);