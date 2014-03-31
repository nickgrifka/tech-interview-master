
function main()
{
   // Set on click listener for the tag results
   document.getElementById('userContributions').addEventListener('click', function(e) {
      var keyString = e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML;
      // alert(keyString);
      // keyString = keyString.replace(/\s+/g, '');
      // alert(keyString);
      window.location = '/?question=' + keyString;
   });
}

$(document).ready(main);