/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var config = {
  apiKey: "AIzaSyDq8ZDd8gxJilYloZEpi6cYAk31OCK2MC0",
  authDomain: "cryptotrade-e6228.firebaseapp.com",
  databaseURL: "https://cryptotrade-e6228.firebaseio.com",
  projectId: "cryptotrade-e6228",
  storageBucket: "cryptotrade-e6228.appspot.com",
  messagingSenderId: "92373556015"
};
firebase.initializeApp(config);
var defaultDatabase = firebase.database();

// Shortcuts to DOM Elements.
var messageForm = document.getElementById('setup-form');
var messageInput = document.getElementById('new-post-message');
var titleInput = document.getElementById('new-post-title2');
var keywordInput = document.getElementById('new-post-keyword');
var destUrlInput = document.getElementById('new-post-destination_url');
var clickonInput = document.getElementById('new-post-clickon');
var commentInput = document.getElementById('new-post-comment');


var signInButton = document.getElementById('sign-in-button');
var signOutButton = document.getElementById('sign-out-button');
var splashPage = document.getElementById('page-splash');
var addPost = document.getElementById('add-posting');
var addButton = document.getElementById('add');
var recentPostsSection = document.getElementById('recent-posts-list');
var userPostsSection = document.getElementById('user-posts-list');
var topUserPostsSection = document.getElementById('top-user-posts-list');
var recentMenuButton = document.getElementById('menu-recent');
var myPostsMenuButton = document.getElementById('menu-my-posts');
var myTopPostsMenuButton = document.getElementById('menu-my-top-posts');
var listeningFirebaseRefs = [];
var context;



var takeScreenShot = function (text) {
  //console.log(commentInput);
  //v//ar el= text;
  //console.log(text);
  var canvas = document.createElement('canvas');
canvas.setAttribute('width','800px');
  canvas.setAttribute('height', '300px');
  canvas.style.width="249px";
  canvas.style.height="90px";
// canvas.width = canvas.clientWidth;
// canvas.height = canvas.clientHeight;
  var initials = "EL";
  var backgroundColor = '#000';
  var options = {
      colorPalette: [
        '#1abc9c', '#2ecc71', '#3498db',
        '#9b59b6', '#34495e', '#16a085',
        '#27ae60', '#2980b9', '#8e44ad',
        '#2c3e50', '#f1c40f', '#e67e22',
        '#e74c3c', '#95a5a6', '#f39c12',
        '#d35400', '#c0392b', '#bdc3c7',
        '#7f8c8d'
      ],
      fontFamily: "'Droid', monospace"
    };
  var context = canvas.getContext('2d');
  var cw=canvas.width;
  var ch=canvas.height;
  //canvas.height='100px';
  context.save();
  context.clearRect(0, 0, cw, ch);

  var fontSize = '38px';
  //console.log(parseInt(ch));
  //Create our font styles
  var heightNumeric = parseInt(ch);
  context.font = '38' + 'px ' + options.fontFamily;
  context.textAlign = 'left';
  context.textBaseline='top';

  
  //context.save();
 
  //Create the color and add our initials
  context.fillStyle = '#000';
  if(text){
  var lines = fragmentText(context,text, cw - parseInt(fontSize,0));
         ch= (lines.length  * heightNumeric)+'px';
         console.log(ch);
         //context.save();
         //context.clearRect(0, 0, cw, ch);
//context.restore();

     lines.forEach(function(line, i) {
       console.log('LINE:',line);

          
         context.fillText(line, 0, (i + 1) * parseInt(fontSize,0));
         
     });

  }
     
     //context.fillText(text, 0, 0 ,294);
context.restore();

return canvas




};



function fragmentText(ctx, text, maxWidth) {
  if(text.length < 1){
    return;
  }
    var words = text.split(' ')|| text,
        lines = [],
        line = "";
    if (ctx.measureText(text).width < maxWidth) {
        return [text];
    }
    while (words.length > 0) {
        while (ctx.measureText(words[0]).width >= maxWidth) {
            var tmp = words[0];
            words[0] = tmp.slice(0, -1);
            if (words.length > 1) {
                words[1] = tmp.slice(-1) + words[1];
            } else {
                words.push(tmp.slice(-1));
            }
        }
        if (ctx.measureText(line + words[0]).width < maxWidth) {
            line += words.shift() + " ";
        } else {
            lines.push(line);
            line = "";
        }
        if (words.length === 0) {
            lines.push(line);
        }
    }
    return lines;
}

/**
 * Saves a new post to the Firebase DB.
 */
// [START write_fan_out]
function writeNewPost(uid, username, picture, title, keyword,destination_url,clickon,comment) {
  // A post entry.
  var postData = {
    author: username,
    uid: uid,
    keyword: keyword,
    title: title,
    starCount: 0,
    authorPic: picture,
    destination_url: destination_url,
    clickon: clickon,
    comment: comment,

  };

  // Get a key for a new Post.
  var newPostKey = firebase.database().ref().child('posts').push().key;
console.log(postData);
  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/posts/' + newPostKey] = postData;
  //updates['/user-posts/' + uid + '/' + newPostKey] = postData;

  return firebase.database().ref().update(updates);
}
// [END write_fan_out]

/**
 * Star/unstar post.
 */
// [START post_stars_transaction]
function toggleStar(postRef, uid) {

  postRef.transaction(function (post) {
    console.log(post)
    if (post) {
      if (post.stars && post.stars[uid]) {
        post.starCount--;
        post.stars[uid] = null;
      } else {
        post.starCount++;
        if (!post.stars) {
          post.stars = {};
        }
        post.stars[uid] = true;
      }
    }
    return post;
  });
}
// [END post_stars_transaction]

/**
 * Creates a History element.
 *
 **/

function createHistoryElement(author, authorPic, postId, username, lastVisitTime, title, typedCount, url, timeStamp) {
  var uid = firebase.auth().currentUser.uid;

  var html =
    '<div class="post post-' + postId + ' mdl-cell mdl-cell--12-col ' +
    'mdl-cell--6-col-tablet mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">' +
    '<div class="mdl-card mdl-shadow--2dp">' +
    '<div class="mdl-card__title mdl-color--light-blue-600 mdl-color-text--white">' +
    '<div>' +
    '<div class="avatar"></div>' +
    '<div class="username mdl-color-text--black"></div>' +
    '</div>' +
    '</div>' +
    '<div class="header">' +
    '<h4 class="mdl-card__title-text"></h4>' +
    '</div>' +
    '<span class="star">' +
    '<div class="not-starred material-icons">star_border</div>' +
    '<div class="starred material-icons">star</div>' +
    '<div class="star-count">0</div>' +
    '</span>' +
    '<div class="username mdl-color-text--black"></div>' +
    '<div class="title"></div>' +
    '<div class="url"></div>' +
    '<div class="lastVisitedTime">' + lastVisitTime + '</div>' +
    '<div class="timeStamp">' + timeStamp + '</div>' +
    '<div class="typedCount">' + typedCount + '</div>' +
    '</div>' +
    '<form>' +
    '<div class="mdl-textfield mdl-js-textfield">' +
    '<input class="mdl-textfield__input new-comment" type="text">' +
    '<label class="mdl-textfield__label">Comment...</label>' +
    '</div>' +
    '</form>' +
    '</div>' +
    '</div>';

  // Create the DOM element from the HTML.
  var div = document.createElement('div');
  div.innerHTML = html;
  var historyElement = div.firstChild;
  if (componentHandler) {
    //componentHandler.upgradeElements(historyElement.getElementsByClassName('mdl-textfield')[0]);
  }


  var star = historyElement.getElementsByClassName('starred')[0];
  var unStar = historyElement.getElementsByClassName('not-starred')[0];

  // Set values.
  historyElement.getElementsByClassName('title')[0].innerText = title;
  historyElement.getElementsByClassName('url')[0].innerText = url;
  historyElement.getElementsByClassName('mdl-card__title-text')[0].innerText = title;
  historyElement.getElementsByClassName('username')[0].innerText = author || 'Anonymous';
  historyElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' +
    (authorPic || './silhouette.jpg') + '")';


  // Listen for the starred status.
  var starredStatusRef = firebase.database().ref('history/' + postId + '/typedCount/' + uid);
  starredStatusRef.on('value', function (snapshot) {
    updateStarredByCurrentUser(historyElement, snapshot.val());
  });

  // Keep track of all Firebase reference on which we are listening.
  listeningFirebaseRefs.push(starredStatusRef);

  // Bind starring action.
  var onStarClicked = function () {
    var globalPostRef = firebase.database().ref('/history/' + postId);

    toggleStar(globalPostRef, uid);
  };
  unStar.onclick = onStarClicked;
  star.onclick = onStarClicked;

  return historyElement;
}


/**
 * Creates a post element.
 * data.key, data.val().title, data.val().keyword, author, data.val().uid, data.val().authorPic,data.val().destination-url,data.val().clickon,data.val().comment
 */
function createPostElement(postId, title, keyword, author, authorId, authorPic, destination_url, clickon,comment) {
  var uid = firebase.auth().currentUser.uid;
console.log(postId);
  var html =
    '<div class="post post-' + postId + ' mdl-cell mdl-cell--12-col ' +
    'mdl-cell--6-col-tablet mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">' +
    '<div class="mdl-card mdl-shadow--2dp">' +
    '<div class="mdl-card__title mdl-color--light-blue-600 mdl-color-text--white">' +
    '<div>' +
    '<div class="avatar"></div>' +
    '<div class="username mdl-color-text--black"></div>' +
    '</div>' +

    '</div>' +
    '<div class="header">' +
    '<h4 class="mdl-card__title-text mdc-ripple-surface demo-surface mdc-elevation--z2"></h4>' +
    '</div>' +
    '<span class="star">' +
    '<div class="not-starred material-icons">star_border</div>' +
    '<div class="starred material-icons">star</div>' +
    '<div class="star-count">0</div>' +
    '</span>' +
    '<div class="keyword"></div>' +
    '<div class="destination_url"></div>' +
    '<div class="clickon"></div>' +
    '<div class="comment"></div>' +
    '<div class="comments-container"></div>' +
    '<form class="add-comment" action="#">' +
    '<div class="mdl-textfield mdl-js-textfield">' +
    '<input class="mdl-textfield__input new-comment" type="text"><br>' +
    '<label class="mdl-textfield__label">Comment...</label>' +
    '</div>' +
    '</form>' +
    '</div>' +
    '</div>';

  // Create the DOM element from the HTML.
  var div = document.createElement('div');
  div.innerHTML = html;
  var postElement = div.firstChild;
  if (componentHandler) {
    componentHandler.upgradeElements(postElement.getElementsByClassName('mdl-textfield')[0]);
  }

  var addCommentForm = postElement.getElementsByClassName('add-comment')[0];
  var commentInput = postElement.getElementsByClassName('new-comment')[0];
  var star = postElement.getElementsByClassName('starred')[0];
  var unStar = postElement.getElementsByClassName('not-starred')[0];

  // Set values.
  postElement.getElementsByClassName('keyword')[0].innerText = keyword;
  postElement.getElementsByClassName('destination_url')[0].innerText = destination_url;
  postElement.getElementsByClassName('clickon')[0].innerText = clickon;
  postElement.getElementsByClassName('comment')[0].innerText = comment;


  postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = title;
  postElement.getElementsByClassName('username')[0].innerText = author || 'Anonymous';
  postElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' +
    (authorPic || './silhouette.jpg') + '")';

  // Listen for comments.
  // [START child_event_listener_recycler]
  var commentsRef = firebase.database().ref('post_comments/' + postId);
  console.log("POST ID: "+ postId); 
  commentsRef.on('child_added', function (data) {
    console.log(data.key); 
    console.log("AAAAAAAA "); 
    addCommentElement(postElement, data.key, data.val().author, data.val().authorPic,data.val().email||"",data.val().lastVisitTime||"",data.val().title||"",data.val().typedCount||"",data.val().url||"");
  });

  commentsRef.on('child_changed', function (data) {
    setCommentValues(postElement, data.key, data.author, data.authorPic,data.email,data.email,data.lastVisitTime,data.title,data.typedCount,data.url);
  });

  commentsRef.on('child_removed', function (data) {
    deleteComment(postElement, data.key);
  });
  // [END child_event_listener_recycler]

  // Listen for likes counts.
  // [START post_value_event_listener]
  var starCountRef = firebase.database().ref('posts/' + postId + '/starCount');
  starCountRef.on('value', function (snapshot) {
    updateStarCount(postElement, snapshot.val());
  });
  // [END post_value_event_listener]

  // Listen for the starred status.
  var starredStatusRef = firebase.database().ref('posts/' + postId + '/stars/' + uid)
  starredStatusRef.on('value', function (snapshot) {
    updateStarredByCurrentUser(postElement, snapshot.val());
  });

  // Keep track of all Firebase reference on which we are listening.
  listeningFirebaseRefs.push(commentsRef);
  listeningFirebaseRefs.push(starCountRef);
  listeningFirebaseRefs.push(starredStatusRef);

  // Create new comment.
  addCommentForm.onsubmit = function (e) {
    e.preventDefault();
    console.log(firebase.auth().providerData);
    createNewComment(postId, firebase.auth().currentUser.displayName, uid, commentInput.value);
    
    commentInput.value = '';
    
    
    commentInput.parentElement.MaterialTextfield.boundUpdateClassesHandler();
  };
  // Bind starring action.
  var onStarClicked = function () {
    console.log('/posts/' + postId)
    var globalPostRef = firebase.database().ref('/posts/' + postId);
    var userPostRef = firebase.database().ref('/user-posts/' + authorId + '/' + postId);
    toggleStar(globalPostRef, uid);
    toggleStar(userPostRef, uid);
  };
  unStar.onclick = onStarClicked;
  star.onclick = onStarClicked;

  return postElement;
}

/**
 * Writes a new comment for the given post.
 */
function createNewComment(postId, username, uid, text) {
  console.log('SCREEN' + text);
  
  firebase.database().ref('post_comments/' + postId).push({
    text: text,
    author: username,
    uid: uid
  });

}

/**
 * Updates the starred status of the post.
 */
function updateStarredByCurrentUser(postElement, starred) {
  if (starred) {
    postElement.getElementsByClassName('starred')[0].style.display = 'inline-block';
    postElement.getElementsByClassName('not-starred')[0].style.display = 'none';
  } else {
    postElement.getElementsByClassName('starred')[0].style.display = 'none';
    postElement.getElementsByClassName('not-starred')[0].style.display = 'inline-block';
  }
}



/**
 * Updates the number of stars displayed for a post.
 */
function updateStarCount(postElement, nbStart) {
  postElement.getElementsByClassName('star-count')[0].innerText = nbStart;
}

/**
 * Creates a comment element and adds it to the given postElement.
 */
function addCommentElement(postElement, id, author, authorPic,email,lastVisitTime,title,typedCount,url) {
  var comment = document.createElement('div');
  comment.classList.add('comment-' + id);
  console.log(author, authorPic,email,lastVisitTime,title,typedCount,url);
  comment.innerHTML = '<span class="author"></span>'+
  '<span class="email"></span>'+
  '<span class="lastVisitTime"></span><span class="title">'+
  '</span><span class="typedCount"></span><span class="url"></span>';
  comment.getElementsByClassName('email')[0].innerText = email;
  comment.getElementsByClassName('lastVisitTime')[0].innerText = lastVisitTime;
  comment.getElementsByClassName('title')[0].innerText = title;
  comment.getElementsByClassName('typedCount')[0].innerText = typedCount;
  comment.getElementsByClassName('url')[0].innerText = url ||"";
  comment.getElementsByClassName('author')[0].innerText = author || 'Anonymous';
    //var canvas =takeScreenShot(text);
    //comment.appendChild(canvas);
  var commentsContainer = postElement.getElementsByClassName('comments-container')[0];
  commentsContainer.appendChild(comment);
}

/**
 * Sets the comment's values in the given postElement.
 */
function setCommentValues(postElement, id, text, author) {
  var comment = postElement.getElementsByClassName('comment-' + id)[0];
  comment.getElementsByClassName('comment')[0].innerText = text;
  comment.getElementsByClassName('fp-username')[0].innerText = author;
}

/**
 * Deletes the comment of the given ID in the given postElement.
 */
function deleteComment(postElement, id) {
  var comment = postElement.getElementsByClassName('comment-' + id)[0];
  comment.parentElement.removeChild(comment);
}

/**
 * Starts listening for new posts and populates posts lists.
 */
function startDatabaseQueries() {
  // [START my_top_posts_query]
  var myUserId = firebase.auth().currentUser.uid;

  var topUserPostsRef = firebase.database().ref('history').orderByValue();


  // [END my_top_posts_query]
  // [START recent_posts_query]
  var recentPostsRef = firebase.database().ref('posts').limitToLast(100);
  // [END recent_posts_query]
  var userPostsRef = firebase.database().ref('user-posts/' + myUserId);

  var fetchHistory = function (historyRef, sectionElement) {

    historyRef.on('child_added', function (data) {
      var title = data.val().title || "";
      var timeStamp = data.val().timestamp || "";
      var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
      containerElement.insertBefore(
        createHistoryElement(data.val().author, data.val().authorPic, data.key, data.val().email, data.val().lastVisitTime, title, data.val().typedCount, data.val().url,timeStamp),
        containerElement.firstChild);
    });
    historyRef.on('child_removed', function (data) {
      var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
      var post = containerElement.getElementsByClassName('history-' + data.key)[0];
      post.parentElement.removeChild(post);
    });
  }


  var fetchPosts = function (postsRef, sectionElement) {
    postsRef.on('child_added', function (data) {
      var author = data.val().author || 'Anonymous';
      var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
      containerElement.insertBefore(
        createPostElement(data.key, data.val().title, data.val().keyword, author, data.val().uid, data.val().authorPic,data.val().destination_url,data.val().clickon,data.val().comment),
        containerElement.firstChild);
    });
    postsRef.on('child_changed', function (data) {
      var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
      var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
      postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = data.val().title;
      postElement.getElementsByClassName('username')[0].innerText = data.val().author;
      postElement.getElementsByClassName('text')[0].innerText = data.val().body;
      postElement.getElementsByClassName('star-count')[0].innerText = data.val().starCount;
    });

    postsRef.on('child_removed', function (data) {
      var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
      var post = containerElement.getElementsByClassName('post-' + data.key)[0];
      post.parentElement.removeChild(post);
    });
  };

  // Fetching and displaying all posts of each sections.
  fetchHistory(topUserPostsRef, topUserPostsSection);
  fetchPosts(recentPostsRef, recentPostsSection);
  fetchPosts(userPostsRef, userPostsSection);

  // Keep track of all Firebase refs we are listening to.
  listeningFirebaseRefs.push(topUserPostsRef);
  listeningFirebaseRefs.push(recentPostsRef);
  listeningFirebaseRefs.push(userPostsRef);
};

/**
 * Writes the user's data to the database.
 */
// [START basic_write]
function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture: imageUrl
  });
}
// [END basic_write]

/**
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
  // Remove all previously displayed posts.
  topUserPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';
  recentPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';
  userPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';

  // Stop all currently listening Firebase listeners.
  listeningFirebaseRefs.forEach(function (ref) {
    ref.off();
  });
  listeningFirebaseRefs = [];
}

/**
 * The ID of the currently signed-in User. We keep track of this to detect Auth state change events that are just
 * programmatic token refresh but not a User status change.
 */
var currentUID;

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged(user) {
  // We ignore token refresh events.
  if (user && currentUID === user.uid) {
    return;
  }

  cleanupUi();
  if (user) {
    if (user) {
      var displayName;
      var profilePic;
      user.providerData.forEach(function (profile) {
        console.log("Sign-in provider: " + profile.providerId);
        console.log("  Provider-specific UID: " + profile.uid);
        console.log("  Name: " + profile.displayName);
        displayName = profile.displayName;
        profilePic = profile.photoURL;
        console.log("  Email: " + profile.email);
        console.log("  Photo URL: " + profile.photoURL);
      });


      user.updateProfile({ displayName: displayName, photoURL: profilePic }).then(
        function () {
          console.log(displayName);
        }, function (error) {
          console.log(error);
        });
    };

    currentUID = user.uid;
    splashPage.style.display = 'none';
    writeUserData(user.uid, user.displayName, user.email, user.photoURL);
    startDatabaseQueries();
  } else {
    // Set currentUID to null.
    currentUID = null;
    // Display the splash page where you can sign-in.
    splashPage.style.display = '';
  }
}

/**
 * Creates a new post for the current user.
 */
function newPostForCurrentUser(title, keyword,destination_url,clickon,comment) {
  // [START single_value_read]
  var userId = firebase.auth().currentUser.uid;

console.log(title, keyword,destination_url,clickon,comment);
  return firebase.database().ref('/users/' + userId).once('value').then(function (snapshot) {

    var username = snapshot.val().username;
    //var username = firebase.auth().currentUser
    //console.log(firebase.auth().currentUser)
    // [START_EXCLUDE]
    return writeNewPost(firebase.auth().currentUser.uid, username,
      firebase.auth().currentUser.photoURL,
      title, keyword,destination_url,clickon,comment);
    // [END_EXCLUDE]
  });
  // [END single_value_read]
}

/**
 * Displays the given section element and changes styling of the given button.
 */
function showSection(sectionElement, buttonElement) {
  console.log(buttonElement)
  recentPostsSection.style.display = 'none';
  userPostsSection.style.display = 'none';
  topUserPostsSection.style.display = 'none';
  addPost.style.display = 'none';
  recentMenuButton.classList.remove('is-active');
  myPostsMenuButton.classList.remove('is-active');
  myTopPostsMenuButton.classList.remove('is-active');

  if (sectionElement) {
    sectionElement.style.display = 'block';
  }
  if (buttonElement) {
    buttonElement.classList.add('is-active');
  }
}

// Bindings on load.
window.addEventListener("load", function () {
  // Bind Sign in button.
  signInButton.addEventListener('click', function () {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  });

  // Bind Sign out button.
  signOutButton.addEventListener('click', function () {
    firebase.auth().signOut();
  });

  // Listen for auth state changes
  firebase.auth().onAuthStateChanged(onAuthStateChanged);

  // Saves message on form submit.
  messageForm.onsubmit = function (e) {
    e.preventDefault();
    
    // var text = messageInput.value;
    var title = titleInput.value;
    var keyword = keywordInput.value;
    var destination_url = destUrlInput.value;
    var clickon = clickonInput.value;
    var comment = commentInput.value;
    console.log(title, keyword,destination_url,clickon);
    if (keyword && title && destination_url && clickon ) {
      newPostForCurrentUser(title, keyword,destination_url,clickon,comment).then(function () {
        myPostsMenuButton.click();
      });
      messageInput.value = '';
      titleInput.value = '';
    }
  };

  // Bind menu buttons.
  recentMenuButton.onclick = function () {
    showSection(recentPostsSection, recentMenuButton);
  };
  myPostsMenuButton.onclick = function () {
    showSection(userPostsSection, myPostsMenuButton);
  };
  myTopPostsMenuButton.onclick = function () {
    console.log('got ere');
    //takeScreenShot();
    showSection(topUserPostsSection, myTopPostsMenuButton);
  };
  addButton.onclick = function () {
    showSection(addPost);
    messageInput.value = '';
    titleInput.value = '';
  };
  recentMenuButton.onclick();
}, false);


