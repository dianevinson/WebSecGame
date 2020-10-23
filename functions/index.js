const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

// Listens for a text string update to /input and creates an
// uppercase version of the message to /output
exports.makeUppercase = functions.database.ref('/input')
    .onUpdate((change, context) => {
      // Grab the updated value of what was changed in the Realtime Database.
      const original = change.after.val();
      console.log("does this work?");
      const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      return change.after.ref.parent.child('output').set(uppercase);
    });

//update leaderboard
exports.addToLeaderboard = functions.database.ref('/games/{gameKey}/results/{nickname}')
    .onCreate((snapshot, context) => {
      // Grab the current value of what was written to the Realtime Database.
      const original = snapshot.val();
      console.log('Uppercasing', context.params.pushId, original);
      const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      return snapshot.ref.parent.child('uppercase').set(uppercase);
    });