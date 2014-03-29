
function main()
{
   // Set on click listener for the tag results
   document.getElementById('userContributions').addEventListener('click', function(e) {
      var keyString = e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].value;
      alert(keyString);
      keyString = keyString.replace(/\s+/g, '');
      alert(keyString);
      window.location = '/?question=' + keyString;
      // var newNode = document.createElement('li');
      // var textNode = document.createTextNode(e.target.innerHTML);
      // newNode.appendChild(textNode);
      // document.getElementById('question_tags').appendChild(newNode);

      // // Remove the tag so it can not be selected again
      // TAGS.splice(TAGS.indexOf(e.target.innerHTML), 1);
      // clearTagSuggestions();
   });
}

$(document).ready(main);