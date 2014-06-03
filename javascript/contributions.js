// Globals
var gTags = ['hash tables', 'binary trees', 'trees', 'arrays', 'queues', 'stacks', 'b+ trees', 'permutations', 'probability',
            'vectors', 'lists', 'linked lists', 'algorithms', 'implementations', 'testing', 'graphs', 'networks', 'patterns',
            'puzzles', 'sorting', 'functions', 'C++', 'python', 'java', 'C#', 'javascript', 'ruby', 'C', 'objective-C', 'theory',
            'maps', 'sets', 'functional programming', 'greedy algorithms', 'divide and conquer', 'dynamic programming',
            'brain teasers', 'object oriented programming', 'programming languages', 'php', 'jquery', 'html', 'mysql', 'css',
            'sql', 'json', 'regex', 'strings', 'multi-threading', 'node.js', 'security', 'sockets', 'http', 'parsing', 'rest',
            'loops', 'design', 'math', 'memory', 'optimization', 'serialization', 'deserialization', 'databases', 'recursion',
            'map-reduce', 'data structures', 'interfaces', 'lambda', 'multidimensional arrays', 'counting'];
var TAGS = gTags;
MAX_TAG_SEARCH_RESULTS = 5;
var oldInput = '';
var POST_URL_PARAMETER = 'p';


function showPostBox()
{
   document.getElementById('shadow').style.display = 'block';
   document.getElementById('post_form_div').style.display = 'block';
   // Refresh the tags
   TAGS = gTags;
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
   TAGS = gTags;
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
   // Empty field checking
   var content = document.getElementById('question_content').value;
   var title = document.getElementById('question_title').value;
   if (content == '' || title == '')
   {
      alert('Make sure you fill in the \'Title\' and \'Question content\' fields!');
      return;
   }

   var form = document.getElementById("post_form")

   // Append the tags to the form
   var tags = grabQuestionTags();
   addHiddenInput(form, 'tags', tags);

   // Append the content to the form
   addHiddenInput(form, 'question_content', content);

   form.submit();
}

function addHiddenInput(form, name, value)
{
   var input = document.createElement('input');
   input.type = 'hidden';
   input.name = name;
   input.value = value;
   form.appendChild(input);
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

function questionRedirect(e)
{
   window.location = '/?q=' + e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML;
}

function addTag(e)
{
      var newNode = document.createElement('li');
      var textNode = document.createTextNode(e.target.innerHTML);
      newNode.appendChild(textNode);
      document.getElementById('question_tags').appendChild(newNode);

      // Remove the tag so it can not be selected again
      TAGS.splice(TAGS.indexOf(e.target.innerHTML), 1);
      clearTagSuggestions();
   }


function main()
{
   // Gather tag search input
   setInterval(function() {tagSearch()}, 50);

   // Set on click listener for the tag results
   document.getElementById('search_results').addEventListener('click', addTag);

   // Redirect when question is clicked
   document.getElementById('userContributions').addEventListener('click', questionRedirect);

   document.getElementById('post_button').addEventListener('click', showPostBox);

   // Bring up the post form if requested
   var p = getUrlParameter(POST_URL_PARAMETER);
   if (p == 'y')
   {
      showPostBox();
   }
}

$(document).ready(main);