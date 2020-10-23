var firebaseConfig = {
  apiKey: "AIzaSyBrZ18XLuroKDTMglj4C5el1yWjxFCLMjA",
  authDomain: "websecgame-1e5cb.firebaseapp.com",
  databaseURL: "https://websecgame-1e5cb.firebaseio.com",
  projectId: "websecgame-1e5cb",
  storageBucket: "websecgame-1e5cb.appspot.com",
  messagingSenderId: "80150343901",
  appId: "1:80150343901:web:e60db9e86883fef8ebab34",
  measurementId: "G-X8XBNRDQ4T"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


var currUser = null;
let gameKey = 0;
var triviaquestions;
var answers = {};
var numQuest = 0;
let totalQuestions = 0;
let mydb = firebase.database();
var samp;
var score = 0;
var nickname = "";

// mydb.ref("games").child("activegame").once('value', ss => {
//   let startTime = (new Date()).getTime();
//   let gameData = { startTime: startTime, numQuest: numQuest, questions: triviaquestions, score: 0 };
// });

/*
sets the current user to be whatever email was authorized
*/
firebase.auth().onAuthStateChanged(user => {
  // if (!!user) {
  //   //alert(`${user.displayName || user.email}`);
  // }
  currUser = user;
  document.getElementById("name").innerHTML = user.email;
});


/*
When the user clicks log in, this signs them in if they've made an account
*/
$("#loginemail").click(() => {
  firebase.auth().signInWithEmailAndPassword($("#email").val(), $("#password").val()).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorMessage);
  });
});

/*
When the user registers, they have to enter their password twice, then it creates an account for them
and signs them in
*/
$("#register").click(() => {
  let pwd1 = $("#password").val();
  let pwd2 = $("#password2").val();
  if (pwd1 == pwd2) {
    firebase.auth().createUserWithEmailAndPassword($("#email").val(), $("#password").val()).catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
    });
  } else {
    alert("passwords don't match");
  }
});

// $("#reset").click(() => {
//   firebase.auth().sendPasswordResetEmail($("#email").val());
// });

/*
The user who creates the game must start the game, so this changes the boolean "started"
value to true once the game's been started
*/
var changeToTrue = function() {
  firebase.database().ref('/games/'+gameKey+'/started').set(true);
  startGame();
}


/*
Changes what elements are visible on the screen once the game is started
*/
var startGame = function () {
  loadQuestion();
  document.getElementById("game").hidden = false;
  document.getElementById("menu").hidden = true;
  document.getElementById("readyGames").hidden =true;
};

/*
This shuffles the answer for the questions that are retrieved by the API
*/
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/*
On creation of a game this fetches the questions and answers from the api
*/
document.querySelector("#createGameButton").addEventListener('click', function () {
  totalQuestions = document.getElementById("numQuestions").value;
  fetch("https://opentdb.com/api.php?amount=" + document.getElementById("numQuestions").value + "&category=" + document.getElementById("topic").value + "&type=multiple",
    { headers: { "Accept": "application/json" } })
    .then(response => response.json())
    .then(data => createGame(data));
});


/*
This loads a questions and its four answers 
*/
var loadQuestion = function () {
  answers = {};
  let questionJSON = triviaquestions[numQuest];
  document.getElementById("question").innerHTML = questionJSON.question;
  Object.values(questionJSON.incorrect_answers).map(x => answers[x] = "false");
  answers[questionJSON.correct_answer] = "true";
  shuffle(answers);
  document.getElementById("answers").innerHTML = "";
  let i  = Math.floor(Math.random() * Math.floor(4));
  for (let j = 0; j < Object.keys(answers).length; j++) {
    let ans = document.createElement("input");
    let lab = document.createElement("label");
    ans.setAttribute("type", "radio");
    ans.setAttribute("id", i);
    ans.setAttribute("value", Object.keys(answers)[i]);
    ans.setAttribute("name", "answer");
    lab.setAttribute("for", i);
    lab.innerHTML = Object.keys(answers)[i];
    // ans.addEventListener("click", function () {
    //   if (Object.values(answers)[i] == "true") {
    //     firebase.database().ref('games/' + gameKey + '/users/' + currUser.uid)
    //   } else if (Object.values(answers)[i] == "false") {
    //     console.log("false");
    //   }
    // })
    document.getElementById("answers").appendChild(ans);
    document.getElementById("answers").appendChild(lab);
    document.getElementById("answerScreen").hidden = true;
    document.getElementById("game").hidden = false;
    i = (i+1)%4;
  }
}

/*
On submission of a question, this will check if the answer is true and if it is it will
increase the users score. This also increments the count of how many questions the user 
has answered so far.
*/
var submitFunc = function () {
  numQuest++;
  if (answers[$('input[name=answer]:checked').val()] == "true") {
    score++;
    }

  let $ansScreen = document.getElementById("answerScreen");
  $ansScreen.innerHTML = "";
  let msg = document.createElement("h1");
  let next = document.createElement("button");
  if (numQuest == totalQuestions) {
    next.innerHTML = "See Results";
    next.addEventListener("click", loadResults)
  } else {
    next.innerHTML = "Next Question";
    next.addEventListener("click", loadQuestion);
  }

  msg.innerHTML = "You answered " + $('input[name=answer]:checked').val() + ", which is " + answers[$('input[name=answer]:checked').val()];
  $ansScreen.appendChild(msg);
  $ansScreen.appendChild(next);
  $ansScreen.hidden = false;
  document.getElementById("game").hidden = true;
}

/*
This sets the results of how the user did at the end in the database.
Still trying to get it to load the results of all of the users!
*/
var loadResults = function () {
  document.getElementById("results").innerHTML = "";

  //getScore();
  firebase.database().ref('games/' + gameKey + '/results').set({
    [nickname]: score
  })
  .then(firebase.database().ref('games/' + gameKey + '/results').once('value').then(function (ss2) {
    samp = ss2;
    Object.keys(ss2.val()).forEach(function (key) {
      let line = document.createElement("h1")
      line.innerHTML = key + " got " + score + " out of " + totalQuestions + " questions";
      document.getElementById("results").appendChild(line);
    });
    let butt = document.createElement("button");
    butt.innerHTML = "Play Again?";
    butt.addEventListener("click", displayMenu);
    document.getElementById("results").appendChild(butt);
    document.getElementById("results").hidden = false;
  }));
}

/*
Obviously this is not in use rn lol but leaving it in for future 
*/
//update leaderboard
// functions.database.ref('/games/{gameKey}/results/{nickname}')
//     .onCreate((snapshot, context) => {
//       // Grab the current value of what was written to the Realtime Database.
//       const original = snapshot.val();
//       console.log('Adding', context.params.pushId, original);
//       //const uppercase = original.toUpperCase();
//       // You must return a Promise when performing asynchronous tasks inside a Functions such as
//       // writing to the Firebase Realtime Database.
//       // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
//      // return snapshot.ref.parent.child('uppercase').set(uppercase);
//      let score = document.createElement("h1");
//      score.innerHTML = nickname + " got " + snapshot.val() +" questions right";
//      document.getElementById("results2").appendChild(score);
//      console.log("butts");
//     });

/*
Prints the results of the game, only for the current user though. Still fixing it.
*/
var updateLeaderboard = firebase.database().ref('games/'+ gameKey + '/results');
updateLeaderboard.on('value', function(snapshot) {
  snap = snapshot;
   const original = snapshot.val();   
   let score = document.createElement("h1");
   score.innerHTML = nickname + " got " + snapshot + " questions right.";
   document.getElementById("results2").appendChild(score);
  //updateStarCount(postElement, snapshot.val());
});

  

/*
When a user enters the access key to join an already created game, this 
retrieves the already created questions and answers for them
*/
var joinGame = function() {
  nickname = document.getElementById("jnickname").value;
  let gameId = document.getElementById("gameid").value;
  gameKey = gameId;
  firebase.database().ref('/games/' +gameId).once('value').then(function(ss) {
    temp = ss;
    triviaquestions = ss.val().questions;
    totalQuestions = ss.val().questions.length;
  });
  var updates ={};
  updates["/games/"+gameKey +"/users/"+ currUser.uid] = score;
  firebase.database().ref().update(updates);
  alert("You're in! Wait for the host to start the game :)");
  startGame();
}

/*
resets score and number of questions answered and displays what should 
be displayed and hides the rest
*/
var displayMenu = function () {
  score = 0;
  numQuest = 0;

  document.getElementById("results").hidden = true;
  document.getElementById("answerScreen").hidden = true;
  document.getElementById("menu").hidden = false;
}

/*
Creates a new game, checks to see that the user is signed it. 
Adds game to the database. Also displays what needs to be displayed
*/
var createGame = function(triviaJSON) {
  if (currUser == null) {
    alert("Please sign in to play Trivia Blast!");
    return;
  }

  triviaquestions = triviaJSON.results;
  let gid = document.createElement("h1");
  mydb.ref("games").child("activegame").once('value', ss => {
    gameKey = firebase.database().ref().child('games').push().key;
    gid.innerHTML = "Your Game ID is " + gameKey;
    let gameData = {started: false, questions: triviaquestions, users: {[currUser.uid]: score}}
    nickname = document.getElementById("nickname").value;
    var updates = {};
    updates['/games/' + gameKey] = gameData;
    return firebase.database().ref().update(updates);

  });

  let butt = document.createElement("button");
  butt.innerHTML = "Start Game";
  butt.addEventListener("click", changeToTrue);


  document.getElementById("readyGames").appendChild(gid);
  document.getElementById("readyGames").appendChild(butt);
  document.getElementById("readyGames").hidden = false; 
  document.getElementById("game").hidden = true;
  document.getElementById("menu").hidden = true;
}



