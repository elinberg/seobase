
'use strict';

// [START all]
// [START import]
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// [END import]

// [START addMessage]
// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
// [START addMessageTrigger]
exports.addMessage = functions.https.onRequest((req, res) => {
// [END addMessageTrigger]
  // Grab the text parameter.
  const original = req.query.text;
  // [START adminSdkPush]
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  admin.database().ref('/messages').push({original: original}).then(snapshot => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    res.redirect(303, snapshot.ref);
  });



  // [END adminSdkPush]
});
// [END addMessage]

// [START makeUppercase]
// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
// [START makeUppercaseTrigger]
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onWrite(event => {
// [END makeUppercaseTrigger]
      // [START makeUppercaseBody]
      // Grab the current value of what was written to the Realtime Database.
      const original = event.data.val();
      console.log('Uppercasing', event.params.pushId, original);
      const uppercase = original.toUpperCase();

      event.data.ref.parent.child('timestamp').set( Date.now());
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      return event.data.ref.parent.child('uppercase').set(uppercase);
      // [END makeUppercaseBody]
    });
// [END makeUppercase]
// [END all]
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onWrite(event => {
// [END makeUppercaseTrigger]
      // [START makeUppercaseBody]
      // Grab the current value of what was written to the Realtime Database.
      const original = event.data.val();
      console.log('Uppercasing', event.params.pushId, original);
      const uppercase = original.toUpperCase();

      event.data.ref.parent.child('timestamp').set( Date.now());
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      return event.data.ref.parent.child('uppercase').set(uppercase);
      // [END makeUppercaseBody]
    });
    // [START addTimeStamp]
    exports.addHistoryTimeStamp = functions.database.ref('/history/{pushId}/title')
    .onWrite(event => {
      // Grab the current value of what was written to the Realtime Database.
      console.log('Adding timestamp', event.params.pushId);
      event.data.ref.parent.child('timestamp').set( Date.now());
    });
    // [START addTimeStamp]

    // [START addTimeStamp]
    exports.addPostsTimeStamp = functions.database.ref('/posts/{pushId}/title')
    .onWrite(event => {
      // Grab the current value of what was written to the Realtime Database.
      console.log('Adding timestamp', event.params.pushId);
      event.data.ref.parent.child('timestamp').set( Date.now());
    });
    // [START addTimeStamp]