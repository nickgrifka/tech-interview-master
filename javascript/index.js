var downVotes = Array();
var upVotes = Array();

function main()
{
    // Set event listener to viewer voting box
    //
    if (document.getElementById('viewer_vote') != null)
    {
        document.getElementById('viewer_vote').addEventListener('click', function(e) {
          // Determine up or down
          if (e.target.className == 'up_vote')
          {
             // alert(e.target.parentNode.parentNode.className);
             upVotes.push(e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML);
          }
          else
          {
             // alert(e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML);
             downVotes.push(e.target.parentNode.parentNode.getElementsByClassName('hiddenQuestionInfo')[0].innerHTML);
          }
          // Make the vote box dissapear
          e.target.parentNode.style.display = 'none';
       });
    }
}

$(document).ready(main);


function loadVotePostData(url)
{
    // Package the voting data
    var vote_data = new Object()
    vote_data['up_votes'] = upVotes;
    vote_data['down_votes'] = downVotes;


    // Create the input
    // var voteInput = document.createElement("input");
    // voteInput.setAttribute("type", "hidden");
    // voteInput.setAttribute("name", "vote_data");
    // voteInput.setAttribute("value", JSON.stringify(vote_data).replace(/\"/g, "'"));

    // Create the form
    // var form = document.createElement('form');
    // form.action = '/';//url;
    // form.method = 'post';
    // form.name = 'vote_form'
    // form.id = 'vote_form'
    // // form._submit_function_ = form.submit;

    // console.log(JSON.stringify(vote_data));

    // // Attach the input and send
    // form.appendChild(voteInput);
    // document.body.appendChild(form);

    // var completedForm = document.getElementById('vote_form');
    // console.log(completedForm);
    // console.log(completedForm.getElementsByTagName('input')[0]);
    // completedForm.submit();

    document.getElementById('vote_data').value = JSON.stringify(vote_data).replace(/\"/g, "'");
    document.getElementById('btnVote').click();
    // var voteForm = document.getElementById('hidden_vote_form');
    // console.log(voteForm.getElementsByTagName('input')[0]);
    // voteForm.submit();


    console.log('Passed submit js fn');
}



// function submitQuestionForm()
// {
//    tags = grabQuestionTags();

//    var tagInput = document.createElement("input");
//    tagInput.setAttribute("type", "hidden");
//    tagInput.setAttribute("name", "tags");
//    tagInput.setAttribute("value", tags);
//    var form = document.getElementById("post_form")
//    form.appendChild(tagInput);
//    // form.submit();
// }


// function grabQuestionTags()
// {
//    var tags = [];
//    var list = document.getElementById('question_tags');
//    var items = list.getElementsByTagName('li');
//    for (var i = 0; i < items.length; i++)
//    {
//       tags.push(items[i].innerHTML);
//    }

//    return tags;
// }