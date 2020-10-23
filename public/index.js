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

//const functions = require('firebase-functions');
//const admin = require('firebase-admin');

//admin.initializeApp();

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

mydb.ref("games").child("activegame").once('value', ss => {
  // alert(ss.val());
  let startTime = (new Date()).getTime();
  let gameData = { startTime: startTime, numQuest: numQuest, questions: triviaquestions, score: 0 };
  // alert(JSON.stringify(gameData));

});

firebase.auth().onAuthStateChanged(user => {
  if (!!user) {
    //alert(`${user.displayName || user.email}`);
  }
  currUser = user;
  document.getElementById("name").innerHTML = user.email;
});

$("#loginemail").click(() => {
  firebase.auth().signInWithEmailAndPassword($("#email").val(), $("#password").val()).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorMessage);
  });
});

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

$("#reset").click(() => {
  firebase.auth().sendPasswordResetEmail($("#email").val());
});

var changeToTrue = function() {
  firebase.database().ref('/games/'+gameKey+'/started').set(true);
  startGame();
}

var startGame = function () {

  loadQuestion();
  document.getElementById("game").hidden = false;
  document.getElementById("menu").hidden = true;
  document.getElementById("readyGames").hidden =true;
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]];
  }
}

document.querySelector("#createGameButton").addEventListener('click', function () {
  totalQuestions = document.getElementById("numQuestions").value;
  fetch("https://opentdb.com/api.php?amount=" + document.getElementById("numQuestions").value + "&category=" + document.getElementById("topic").value + "&type=multiple",
    { headers: { "Accept": "application/json" } })
    .then(response => response.json())
    .then(data => createGame(data));
});

var loadQuestion = function () {
  answers = {};
  let questionJSON = triviaquestions[numQuest];
  document.getElementById("question").innerHTML = questionJSON.question;
  Object.values(questionJSON.incorrect_answers).map(x => answers[x] = "false");
  //console.log(answers);
  answers[questionJSON.correct_answer] = "true";
  //console.log(questions);
  shuffle(answers);
  document.getElementById("answers").innerHTML = "";
  let i  = Math.floor(Math.random() * Math.floor(4));
  console.log("i is "+ i);
  for (let j = 0; j < Object.keys(answers).length; j++) {
    let ans = document.createElement("input");
    let lab = document.createElement("label");
    ans.setAttribute("type", "radio");
    ans.setAttribute("id", i);
    ans.setAttribute("value", Object.keys(answers)[i]);
    ans.setAttribute("name", "answer");
    /// ans.setAttribute("name", )
    lab.setAttribute("for", i);
    //console.log(Object.keys(questions)[i]);
    lab.innerHTML = Object.keys(answers)[i];
    ans.addEventListener("click", function () {
      console.log("clicked");
      if (Object.values(answers)[i] == "true") {
        //lab.style.color ="green";
        //console.log("correct");
        firebase.database().ref('games/' + gameKey + '/users/' + currUser.uid)
      } else if (Object.values(answers)[i] == "false") {
        //lab.style.color = "red";
        console.log("false");
      }
    })
    document.getElementById("answers").appendChild(ans);
    document.getElementById("answers").appendChild(lab);
    //$("#answerScreen").hidden = true;
    document.getElementById("answerScreen").hidden = true;
    //$("#game").hidden = false;
    document.getElementById("game").hidden = false;
    i = (i+1)%4;
  }
}


var submitFunc = function () {
  numQuest++;
  console.log("butt");
  console.log($('input[name=answer]:checked').val());
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
  console.log(answers);
  console.log(answers[$('input[name=answer]:checked').val()]);

  msg.innerHTML = "You answered " + $('input[name=answer]:checked').val() + ", which is " + answers[$('input[name=answer]:checked').val()];
  $ansScreen.appendChild(msg);
  $ansScreen.appendChild(next);
  $ansScreen.hidden = false;
  document.getElementById("game").hidden = true;
}

var loadResults = function () {
  document.getElementById("results").innerHTML = "";

  //getScore();
  firebase.database().ref('games/' + gameKey + '/results').set({
    [nickname]: score
  })
  .then(firebase.database().ref('games/' + gameKey + '/results').once('value').then(function (ss2) {
    samp = ss2;
    console.log(Object.keys(ss2.val()).length);
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

var snap;
var updateLeaderboard = firebase.database().ref('games/'+ gameKey + '/results');
updateLeaderboard.on('value', function(snapshot) {
  snap = snapshot;
   const original = snapshot.val();
   console.log("Adding ", original);
   
   let score = document.createElement("h1");
   score.innerHTML = nickname + " got " + snapshot + " questions right.";
   document.getElementById("results2").appendChild(score);
  //updateStarCount(postElement, snapshot.val());
});

  

var temp;

var joinGame = function() {
  console.log("your in the func at least");
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

var displayMenu = function () {
  score = 0;
  numQuest = 0;

  document.getElementById("results").hidden = true;
  document.getElementById("answerScreen").hidden = true;
  document.getElementById("menu").hidden = false;
}

var createGame = function(triviaJSON) {
  if (currUser == null) {
    alert("Please sign in to play Trivia Blast!");
    return;
  }

  triviaquestions = triviaJSON.results;
  let gid = document.createElement("h1");
  mydb.ref("games").child("activegame").once('value', ss => {
    // alert(ss.val());
    gameKey = firebase.database().ref().child('games').push().key;
    console.log(gameKey);
    gid.innerHTML = "Your Game ID is " + gameKey;
    let gameData = {started: false, questions: triviaquestions, users: {[currUser.uid]: score}}
    nickname = document.getElementById("nickname").value;
    var updates = {};
    updates['/games/' + gameKey] = gameData;
    // updates['/games/'+ gameKey + "/users"] = currUser.email;
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



