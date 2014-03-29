// Globals
var TAGS = ['hash tables', 'binary trees', 'trees', 'arrays', 'queues', 'stacks'];
MAX_TAG_SEARCH_RESULTS = 5;
var oldInput = '';


function showPostBox()
{
   document.getElementById('shadow').style.display = 'block';
   document.getElementById('post_form_div').style.display = 'block';
   // Refresh the tags
   TAGS = ['hash tables', 'binary trees', 'trees', 'arrays', 'queues', 'stacks'];
}

function closePostBox()
{
   document.getElementById('shadow').style.display = 'none';
   document.getElementById('post_form_div').style.display = 'none';
   clearPostForm();
}

function clearPostForm()
{
   clearTagSuggestions();
   document.getElementById('question_title').value = '';
   document.getElementById('question_content').value = '';
   document.getElementById('question_tags').innerHTML = '';
   TAGS = ['hash tables', 'binary trees', 'trees', 'arrays', 'queues', 'stacks'];
}

function clearTagSuggestions()
{
   document.getElementById('search_results').innerHTML = '';
   document.getElementById('tag_search').value = '';
}


function tagSearch()
{
   var input = document.getElementById('tag_search').value;
   input = input.toLowerCase();

   if (input != oldInput)
   {
      // clear the old query results
      document.getElementById('search_results').innerHTML = '';
      console.log('cleared search results');

      if (input == '')
      {
         oldInput = input;
         return true;
      }

      var numResults = 0;
      for (var i = 0; i < TAGS.length; i++)
      {
         if (TAGS[i].indexOf(input) != -1 && numResults < MAX_TAG_SEARCH_RESULTS)
         {
            console.log('match with: ' + TAGS[i]+ '\n');
            var table = document.getElementById('search_results');
            var newRow = table.insertRow(0);
            var newCell = newRow.insertCell(0);
            newCell.innerHTML = TAGS[i];
            numResults++;
         }
      }
   }
   oldInput = input;
}

function submitQuestionForm()
{
   tags = grabQuestionTags();

   var tagInput = document.createElement("input");
   tagInput.setAttribute("type", "hidden");
   tagInput.setAttribute("name", "tags");
   tagInput.setAttribute("value", tags);
   var form = document.getElementById("post_form")
   form.appendChild(tagInput);
   // form.submit();
}


function grabQuestionTags()
{
   var tags = [];
   var list = document.getElementById('question_tags');
   var items = list.getElementsByTagName('li');
   for (var i = 0; i < items.length; i++)
   {
      tags.push(items[i].innerHTML);
   }

   return tags;
}


function main()
{
   // Gather tag search input
   setInterval(function() {tagSearch()}, 50);

   // Set on click listener for the tag results
   document.getElementById('search_results').addEventListener('click', function(e) {
      var newNode = document.createElement('li');
      var textNode = document.createTextNode(e.target.innerHTML);
      newNode.appendChild(textNode);
      document.getElementById('question_tags').appendChild(newNode);

      // Remove the tag so it can not be selected again
      TAGS.splice(TAGS.indexOf(e.target.innerHTML), 1);
      clearTagSuggestions();
   });
}

$(document).ready(main);