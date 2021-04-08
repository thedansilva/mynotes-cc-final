var express = require('express');
var path = require('path');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var PORT = process.env.PORT || 5000;
var app = express();
const request = require('request');
var fs = require('fs');
const _ = require('lodash');
const multer = require('multer'); // file storing middleware
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: "REDACTED",
  secretAccessKey: "REDACTED"
});


// set up session
app.use(session({
  secret: 'CLOOD',
  saveUninitialized: true,
  resave: true
}));
var ssn;

// declare ejs, views, etc
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// create connection to mongoDB atlas
const { MongoClient } = require("mongodb");
const e = require('express');
const { RSA_NO_PADDING, SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } = require('constants');
const { response } = require('express');
const { cursorTo } = require('readline');
const { callbackify } = require('util');
const { createBrotliCompress } = require('zlib');
const { use } = require('passport');
const { reject } = require('lodash');
const { resolve } = require('path');
const { get } = require('request');
const uri = "mongodb+srv://ccdbUser:3OWu3ahwvbD90V0D@cluster0.dvpy1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


if (client.isConnected()) {
  console.log("Client already connected");
} else {
  mongoClient();
}


async function mongoClient() {
  await client.connect().catch(error => console.error(error));

  /***********************************************************************************************
   * ASYNC FUNCTIONS - DESIGNED TO INTERACT WITH THE DATABASE OFF A BUTTONCLICK IN THE EJS FILES *
   ***********************************************************************************************/

  async function registerUser(userToRegister, passToRegister) {
    try {
      //await client.connect();
      passToRegister = passToRegister + ""; // convert to string to prevent weird behaviour with mongodb
      var db = client.db('MYNOTES');
      var usersDB = db.collection('userCol');
      // check if user exists
      var isRegistered = await usersDB.findOne({ username: userToRegister });
      if (isRegistered == null) {
        // nobody found with that username - create.
        console.log("nobody found with the username " + userToRegister);
        maxIDUser = await usersDB.find().sort({ userID: -1 }).limit(1).next(); // get the object of the user with the highest ID in the USERS collection
        console.log(maxIDUser.userID + 1);
        try {
          var date = (new Date()).toISOString().split('T')[0];
          await usersDB.insertOne({ userID: maxIDUser.userID + 1, username: userToRegister, password: passToRegister, notesRank: 0, dateJoined: date });
          // add user to database with incremented userID and user's preferred data
          return true;
        } catch (e) {
          print(e);
          return false;
        };
      } else {
        // do nothing because the user already exists
        return false;
      }
    } finally {
      //await client.close();
    }
  }

  async function loginUser(userToLogin, passwordCheck) {
    try {
      var db = client.db('MYNOTES');
      var usersDB = db.collection('userCol');
      // check if user exists
      var isRegistered = await usersDB.findOne({ username: userToLogin }); // find user who is trying to login
      if (isRegistered != null) { // if user exists
        if (isRegistered.password === passwordCheck) { // if the password matches, log user in and set session variables etc
          console.log("PASSWORD CORRECT");
          return true;
        } else {
          return false; // wrong password
        }
      } else {
        return false; // user doesn't exist
      }
    } finally {
    }
  }

  // GENERIC USER ID GETTER

  async function getUserID(username) {
    try {
      var db = client.db('MYNOTES');
      var usersDB = db.collection('userCol');
      var userData = await usersDB.findOne({ username: username }); // find user
      console.log("From getuser:" + userData.username);
      if (userData != null) { // if user exists
        return userData.userID;
      } else {
        return 0; // user doesn't exist
      }
    } finally {
    }
  }

  /**************
   * GET ROUTES *
   **************/
  var userID;
  // ROOT DIRECTORY WITH SESSION "COOKIE"
  app.get('/', (req, res) => {
    ssn = req.session;
    ssn.userID;
    ssn.username;
    ssn.password;
    console.log("Current user is " + ssn.username);
    console.log("Current userID is " + ssn.userID);
    if (ssn.username == null) {
      res.render('pages/index'); // render the default page if not logged in
    } else {
      userID = ssn.userID;
      res.render('pages/home', { username: ssn.username, userID: ssn.userID })
    }
  });

  app.get('/login', (req, res) => res.render('pages/login')); // go to the proper pages if clicked on
  app.get('/register', (req, res) => res.render('pages/register'));
  app.get('/home', (req, res) => {
    ssn = req.session;
    ssn.userID;
    ssn.username;
    ssn.password;
    if (ssn.username == null) {
      res.redirect('/'); // direct to the default page if not logged in
    } else {
      res.render('pages/home', { username: ssn.username, userID: ssn.userID })
    }
  });



  app.get('/logout', (req, res) => {
    ssn = req.session;
    ssn.userID = null; // null all logged in values
    ssn.username = null;
    ssn.password = null;
    res.redirect('/'); // go to root page
  });

  app.get('/upload-success', (req, res) => res.render('pages/upload-success')); // go to the proper pages if clicked on
  app.get('/upload-failure', (req, res) => res.render('pages/upload-failure')); // go to the proper pages if clicked on
  app.get('/courses404', (req, res) => res.render('pages/courses404'));

  // LISTEN
  app.listen(PORT, () => console.log(`Listening on ${PORT}`));

  /*************************************************
   * POST FUNCTIONS FOR REGISTERING AND LOGGING IN *
   *************************************************/
  app.post('/register', async function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (username && password) { // if both not empty 
      var didRegister = await registerUser(username, password).catch(console.dir); // returns true if the user successfully registered
      console.log(didRegister);
      if (didRegister) {
        res.render('pages/register-success');
      } else {
        res.render('pages/register-fail');
      }
    }
  });

  app.post('/login', async function (req, res) {
    ssn = req.session;
    var username = req.body.username;
    var password = req.body.password;
    if (username && password) { // if both not empty 
      var didLoggedIn = await loginUser(username, password).catch(console.dir); // returns true if the user successfully logged in
      console.log(didLoggedIn);
      if (didLoggedIn) {
        ssn.username = username;
        ssn.userID = await getUserID(username);
        console.log("CHANGED SSN USERNAME AND ID");
        res.redirect('/');
      } else {
        ssn.username = null;
        ssn.userID = null;
        console.log("DIDN'T CHANGE ANYTHING");
        res.render('pages/login-fail');
      }
    }
  });

  /*********************************************
   * FETCH BACKEND FUNCTIONS *******************
   * These functions are designed to parse
   * requests from ejs and grab data from their
   * respective "database" functions. Then,
   * those results are interpreted on the ejs
   * page through their respective fetching
   * functions.
   *********************************************/

  /*****************
  GET COURSES  ****
  ******************/

  app.get('/getCoursesJSON', function (req, res) {
    ssn = req.session;
    getCourses(ssn.userID, res); // pass the response to the callback function to send the stuff
  });

  function getCourses(userID, res) {
    var db = client.db('MYNOTES');
    var courses = db.collection('usersCoursesCol');
    courses.find({ userID: userID }).toArray(function (err, cursor) {
      buildCourses(err, cursor, res);
    });
  }

  async function buildCourses(err, userInCourses, res) { // assigns names to the courses that the user is in based on ID (coursesCol).
    if (err) console.error(err);
    var db = client.db('MYNOTES');
    var courseNames = db.collection('coursesCol');
    var promises = [];
    var courses = [];
    if (userInCourses.length >= 0) {
      for (var x = 0; x < userInCourses.length; x++) {
        //console.log(userInCourses[x].userID + " " + userInCourses[x].courseID);
        promises.push(new Promise((resolve, reject) => {
          courseNames.findOne({ courseID: userInCourses[x].courseID }, function (err, cursor) {
            if (err) reject(err);
            else {
              courses.push(cursor);
              resolve(cursor);
            }
          });
        }));
      }
      const result = await Promise.all(promises);
      //console.log("Promises length is " + promises.length);
      /*for (var x = 0; x < promises.length; x++) {
        console.log(courses[x].courseName);
      }*/

      courses.sort(function (a, b) {
        return a.courseID - b.courseID;
      });
      //console.log("Passing courses to My Courses")
      res.contentType('application/json');
      res.send(JSON.stringify(courses));
    }
  }

  /************************
  COURSES/USERS PAGE ***
  *************************/

  app.get('/courses/', function (req, res) {
    res.redirect('/');
  });

  app.get('/courses/:id', function (req, res) {
    ssn = req.session;
    console.log("The profile is " + req.params.id);
    res.render('pages/courses', {
      courseID: req.params.id, // goes to the /courses.ejs page with the variable courseID taken from the link
      userID: ssn.userID
    });
  });

  app.get('/profile/', (req, res) => {
    res.redirect('/'); // direct to the default page if not logged in
  });

  app.get('/profile/:id', function (req, res) {
    console.log("test");
    ssn = req.session;
    console.log("The user is " + req.params.id);
    var db = client.db('MYNOTES');
    var userDB = db.collection('userCol');
    console.log("user id is: " + req.params.id);
    var userData = userDB.findOne({ userID: Number(req.params.id) }, function (err, cursor) {
      //console.log(userData);
      res.render('pages/profile', {
        userToSee: req.params.id,
        userID: req.params.id,
        username: cursor.username,
        dateJoined: cursor.dateJoined,
        notesRank: cursor.notesRank
        // userID: 0,
        // username: "silvaDanny",
        // dateJoined: "2021-04-06",
        // notesRank: 25
      });
    });
  });

  /*******************
  GET JOINABLE COURSES (courses the user isn't in)
  ******************/

  app.get('/getJoinableCoursesJSON', function (req, res) {
    ssn = req.session;
    getJoinableCourses(ssn.userID, res); // pass the response to the callback function to send the stuff
  });

  function getJoinableCourses(userID, res) {
    var db = client.db('MYNOTES');
    var courses = db.collection('usersCoursesCol');
    courses.find({ userID: userID }).toArray(function (err, cursor) { //gets all courses the user is currently in 
      buildJoinableCourses(err, cursor, res);
    });
  }

  async function buildJoinableCourses(err, userInCourses, res) {
    if (err) console.error(err);
    var db = client.db('MYNOTES');
    var courseNames = db.collection('coursesCol');
    var promises = [];
    var allCourses = [];
    var coursesUserNotIn = [];
    promises.push(new Promise((resolve, reject) => {
      courseNames.find().toArray(function (err, cursor) { // gets all courses in an array (which is going to be an array of objects)
        if (err) reject(err);
        else {
          allCourses.push(cursor);
          resolve(cursor);
        }
      });
    }));
    const result = await Promise.all(promises);
    var notInThisClass = true;
    for (var x = 0; x < allCourses[0].length; x++) {
      notInThisClass = true;
      for (var y = 0; y < userInCourses.length; y++) {
        if (userInCourses[y].courseID == allCourses[0][x].courseID) {
          notInThisClass = false;
        }
      }
      if (notInThisClass) {
        coursesUserNotIn.push(allCourses[0][x]);
      }
    }

    coursesUserNotIn.sort(function (a, b) {
      return a.courseID - b.courseID;
    });

    res.contentType('application/json');
    res.send(JSON.stringify(coursesUserNotIn));
  }

  /*******************
    GET ALL COURSES 
    ******************/

  app.get('/getAllCoursesJSON', function (req, res) {
    ssn = req.session;
    getAllCourses(ssn.userID, res); // pass the response to the callback function to send the stuff
  });

  function getAllCourses(userID, res) {
    var db = client.db('MYNOTES');
    var courses = db.collection('coursesCol');
    var allCourses = [];
    var allCoursesCursor = [];
    courses.find().toArray(function (err, cursor) { //gets all courses the user is currently in 
      allCoursesCursor.push(cursor);
      for (var x = 0; x < allCoursesCursor[0].length; x++) {
        allCourses.push(allCoursesCursor[0][x]);
      }
      allCourses.sort(function (a, b) {
        return a.courseID - b.courseID;
      });
      res.contentType('application/json');
      res.send(JSON.stringify(allCourses));
    });
  }

  /*******************
  GET COURSE NAME GIVEN A SPECIFIC COURSEID 
  ******************/

  app.post('/getCourseNameJSON', function (req, res) {
    getCourseName(req.body.courseID, res); // pass the response to the callback function to send the stuff
  });

  function getCourseName(courseID, res) {
    var db = client.db('MYNOTES');
    var courses = db.collection('coursesCol');
    var allCourses = [];
    var allCoursesCursor = [];
    courses.find({ courseID: courseID }).toArray(function (err, cursor) { //gets all courses the user is currently in 
      allCoursesCursor.push(cursor);
      for (var x = 0; x < allCoursesCursor[0].length; x++) {
        //console.log(cursor);
        allCourses.push(allCoursesCursor[0][x]);
      }

      res.contentType('application/json');
      res.send(JSON.stringify(allCourses));
    });
  }

  /*******************
  CHECK IF USER IS IN A COURSE
  ******************/

  app.post('/getIfUserIsInCourseJSON', function (req, res) {
    ssn = req.session;
    console.log("CHECKING FOR USER " + ssn.userID + " IN GROUP " + req.body.courseID);
    getIfUserIsInCourse(ssn.userID, req.body.courseID, res); // pass the response to the callback function to send the stuff
  });

  function getIfUserIsInCourse(userID, courseID, res) {
    var db = client.db('MYNOTES');
    var courses = db.collection('usersCoursesCol');
    var allCourses = [];
    var allCoursesCursor = [];
    courses.find({ userID: userID, courseID: courseID }).toArray(function (err, cursor) { //gets all courses the user is currently in 
      allCoursesCursor.push(cursor);
      for (var x = 0; x < allCoursesCursor[0].length; x++) {
        allCourses.push(allCoursesCursor[0][x]);
      }
      allCourses.sort(function (a, b) {
        return a.courseID - b.courseID;
      });
      res.contentType('application/json');
      res.send(JSON.stringify(allCourses));
    });
  }

  /******
   * GET ALL USERS IN A COURSE
   ***/

  app.post('/getAllUsersJSON', function (req, res) {
    ssn = req.session;
    getPeopleInTheCourse(ssn.userID, req.body.courseID, res); // pass the response to the callback function to send the stuff
  });

  function getPeopleInTheCourse(userID, courseID, res) {
    var db = client.db('MYNOTES');
    var usersCourses = db.collection('usersCoursesCol');
    var allCourses = [];
    var allCoursesCursor = [];
    usersCourses.find({ courseID: courseID }).toArray(function (err, cursor) {
      allCoursesCursor.push(cursor);
      for (var x = 0; x < allCoursesCursor[0].length; x++) {
        allCourses.push(allCoursesCursor[0][x]);
      }
      getMembersFromID(allCourses, courseID, res);
    });
  }

  function getMembersFromID(usersInCourseArray, courseID, res) {
    var db = client.db('MYNOTES');
    var users = db.collection('userCol');
    var usersAndUsernames = [];
    var usersToHaveBeforePushing = usersInCourseArray.length;
    console.log("Gotta do it " + usersToHaveBeforePushing + " times");
    var counter = 0;
    usersInCourseArray.forEach(data => {
      users.find({ userID: data.userID }).toArray(function (err, cursor) {
        counter++;
        usersAndUsernames.push({ userID: cursor[0].userID, username: cursor[0].username });
        if (counter == usersInCourseArray.length) {
          console.log("done");
          submitMembers(usersAndUsernames, res);
        }
      });
    });
  }

  function submitMembers(array, res) {

    array.sort(function (a, b) {
      return a.userID - b.userID;
    });

    res.contentType('application/json');
    res.send(JSON.stringify(array));
  }

  /*******************
  GET ALL FILES FROM A SPECIFIC COURSE 
  ******************/

  app.post('/getAllFilesFromCourseJSON', function (req, res) {
    ssn = req.session;
    getAllFilesFromCourse(req.body.courseID, res); // pass the response to the callback function to send the stuff
  });

  function getAllFilesFromCourse(courseID, res) {
    var db = client.db('MYNOTES');
    var courses = db.collection('fileCol');
    var allFiles = [];
    var allFilesCursor = [];
    console.log("The courseID is " + courseID);
    courses.find({ courseID: Number(courseID) }).toArray(function (err, cursor) { //gets all courses the user is currently in 
      allFilesCursor.push(cursor);
      //console.log("inside courses.find");
      for (var x = 0; x < allFilesCursor[0].length; x++) {
        allFiles.push(allFilesCursor[0][x]);
      }

      //console.log(allFiles);
      res.contentType('application/json');
      res.send(JSON.stringify(allFiles));
    });
  }

/*****************
  GET COURSES OF SPECIFIC USER ****
  ******************/

  app.post('/getSpecificUserCoursesJSON', function (req, res) {
    var thisUserID = req.body.id;
    getSpecificCourses(thisUserID, res); // pass the response to the callback function to send the stuff
  });

  function getSpecificCourses(userID, res) {
    var db = client.db('MYNOTES');
    var courses = db.collection('usersCoursesCol');
    courses.find({ userID: userID }).toArray(function (err, cursor) {
      buildSpecificCourses(err, cursor, res);
    });
  }

  async function buildSpecificCourses(err, userInCourses, res) { // assigns names to the courses that the user is in based on ID (coursesCol).
    if (err) console.error(err);
    var db = client.db('MYNOTES');
    var courseNames = db.collection('coursesCol');
    var promises = [];
    var courses = [];
    if (userInCourses.length >= 0) {
      for (var x = 0; x < userInCourses.length; x++) {
        //console.log(userInCourses[x].userID + " " + userInCourses[x].courseID);
        promises.push(new Promise((resolve, reject) => {
          courseNames.findOne({ courseID: userInCourses[x].courseID }, function (err, cursor) {
            if (err) reject(err);
            else {
              courses.push(cursor);
              resolve(cursor);
            }
          });
        }));
      }
      const result = await Promise.all(promises);
      //console.log("Promises length is " + promises.length);
      /*for (var x = 0; x < promises.length; x++) {
        console.log(courses[x].courseName);
      }*/

      courses.sort(function (a, b) {
        return a.courseID - b.courseID;
      });
      //console.log("Passing courses to My Courses")
      res.contentType('application/json');
      res.send(JSON.stringify(courses));
    }
  }


  /*******************
  GET ALL FILES A USER HAS UPLOADED 
  ******************/

  app.post('/getAllFilesFromUserJSON', function (req, res) {
    thisuserID = req.body.id;
    getAllFilesFromUser(thisuserID, res); // pass the response to the callback function to send the stuff
  });

  function getAllFilesFromUser(userID, res) {
    var db = client.db('MYNOTES');
    var filesDB = db.collection('fileCol');
    var allFiles = [];
    var allFilesCursor = [];
    filesDB.find({ userID: userID }).toArray(function (err, cursor) { //gets all files the user uploaded 
      allFilesCursor.push(cursor);
      for (var x = 0; x < allFilesCursor[0].length; x++) {
        allFiles.push(allFilesCursor[0][x]);
      }

      console.log(allFiles);
      res.contentType('application/json');
      res.send(JSON.stringify(allFiles));
    });
  }

  /*******************
   * LEAVE COURSE ****
   *******************/

  app.post('/leaveGroup', async function (req, res) {
    try {
      console.log("The group ID is " + req.body.groupID);
      await removeFromCourse(req.body.userID, req.body.groupID, res);
    } catch (e) {
      console.log("ERROR FROM LEAVING GROUP CAUGHT, REDIRECTING");
      res.redirect('/');
    } finally {
    }
  });

  async function removeFromCourse(userID, courseID, res) {
    try {
      var db = client.db('MYNOTES');
      var coursesDB = db.collection('usersCoursesCol');
      // check if user exists
      var userData = await coursesDB.findOne({ userID: userID, courseID: courseID });
      if (userData == null) { // if watchlist already exists
        // do nothing
        console.log("group doesn't exist");

      } else {
        // add ticker to watchlist for the user.
        await coursesDB.deleteOne({ userID: userID, courseID: courseID });
        console.log("removed course with ID " + courseID + " for user " + userID);
        //response.json(body);
        //console.log(body);
      }
    } finally {
      res.sendStatus(200); // sends response.ok
    }
  }

  /*******************
   * JOIN COURSE ****
   *******************/

  app.post('/joinGroup', async function (req, res) {
    try {
      console.log("The group ID is " + req.body.groupID);
      await joinCourse(req.body.userID, req.body.groupID, res);
    } catch (e) {
      console.log("ERROR FROM JOINING GROUP CAUGHT, REDIRECTING");
      res.redirect('/');
    } finally {
    }
  });

  async function joinCourse(userID, courseID, res) {
    try {
      var db = client.db('MYNOTES');
      var coursesDB = db.collection('usersCoursesCol');
      // check if user exists
      var userData = await coursesDB.findOne({ userID: userID, courseID: courseID });
      if (userData == null) { // if watchlist already exists
        // do nothing
        await coursesDB.insertOne({ userID: userID, courseID: courseID });
        console.log("added course with ID " + courseID + " for user " + userID);
      } else {
        // add ticker to watchlist for the user.
        console.log("user already in group");
        //response.json(body);
        //console.log(body);
      }
    } finally {
      //res.redirect('/');
      res.sendStatus(200); // sends response.ok
    }
  }

  /***********
   * CHAT STUFF
   **********/

  /*****************
  GET COURSES  ****
  ******************/

  app.get('/updateChatJSON', function (req, res) {
    ssn = req.session;
    getChat(ssn.userID, res); // pass the response to the callback function to send the stuff
  });

  function getChat(userID, res) {
    var db = client.db('MYNOTES');
    var chat = db.collection('chatCol');
    chat.find().toArray(function (err, cursor) {
      buildChat(err, cursor, res);
      // just passing back thing for now for simplicity to test if it works
      // console.log("Passing chat to My Courses")
      // res.contentType('application/json');
      // res.send(JSON.stringify(cursor));
    });
  }

  async function buildChat(err, chats, res) { // gets the NotesRank as well as the username of the userID of each chat. passes back a built collection. sorts by date
    if (err) console.error(err);
    var db = client.db('MYNOTES');
    var userData = db.collection('userCol');
    var promises = [];
    var users = [];
    var combinedData = [];
    if (chats.length >= 0) {
      //console.log(userInCourses[x].userID + " " + userInCourses[x].courseID);
      promises.push(new Promise((resolve, reject) => {
        userData.find().toArray(function (err, cursor) {
          if (err) reject(err);
          else {
            users.push(cursor); // only push the first value because it contains all the data 
            //console.log(cursor[0]);
            resolve(cursor);
          }
        });
      }));
      const result = await Promise.all(promises);
      users.sort(function (a, b) {
        return a.userID - b.userID;
      });
      //console.log("Promises length is " + promises.length);
      for (var x = 0; x < chats.length; x++) {
        // console.log(chats);
        for (var y = 0; y < users[0].length; y++) {
          if (users[0][y].userID == chats[x].userID) {
            combinedData.push({ userID: Number(chats[x].userID), courseID: Number(chats[x].courseID), message: chats[x].message, notesRank: users[0][y].notesRank, username: users[0][y].username, dateTime: chats[x].dateTime });
          }
        }
      }

      //console.log("Passing chat");
      //console.log(combinedData);
      res.contentType('application/json');
      res.send(JSON.stringify(combinedData));
    }
  }

  /*******
   * SEND A MESSAGE
   ************/

  app.post('/sendMessageJSON', async function (req, res) {
    try {
      ssn = req.session;
      var message = req.body.message;
      var courseID = req.body.courseID;
      if (message.length > 0) {
        // console.log("The message is " + req.body.message + " for " + req.body.courseID);
        var db = client.db('MYNOTES');
        var chat = db.collection('chatCol');
        await chat.insertOne({ userID: Number(ssn.userID), courseID: Number(courseID), message: message, dateTime: new Date().toISOString() });
      } else {
        console.log("I'm not sending that lol");
      }
      //await removeFromCourse(ssn.userID, req.body.groupID, res);
    } catch (e) {
      console.log("ERROR FROM SENDING MESSAGE, REDIRECTING");
      res.redirect('/');
    } finally {
    }
  });


  /************
   * FILE-RELATED FUNCTIONS (upload file, download file, generate UUID for file, assign UUID to filename locally, etc.)
   *********/

  //MULTER CONFIG: to get file photos to temp server storage
  var fileName = "";
  var uploadParams = { Bucket: "mynotesbucket", Key: '', Body: '' };
  //const PutObjectCommand = require('client-s3');
  const multerConfig = {
    storage: multer.diskStorage({ //Setup where the user's file will go
      destination: function (req, file, next) {
        next(null, './public/file-storage');
      },

      //Then give the file a unique name
      filename: function (req, file, next) {
        console.log(file);
        const ext = file.mimetype.split('/')[1];
        //fileName = file.fieldname + '-' + Date.now() + '.' + ext;
        fileName = file.originalname;
        next(null, fileName);
      }
    }),

    //A means of ensuring only images are uploaded. 
    fileFilter: function (req, file, next) {
      if (!file) {
        next();
      }
      next(null, true);
    }
  };

  app.post('/upload', multer(multerConfig).single('photo'), function (req, res) {
    uploadFile(Number(req.body.userID), req, res, fileName);
  });

  function uploadFile(userId, req, res, fileName) {
    console.log("The user uploading the file is " + userId);
    ssn = req.session;
    var UUID = generateUUID();
    var tryagain = 0;
    while (tryagain < 10 || checkForUUID(UUID) == false) {
      UUID = generateUUID(); // keep generating unique UUIDs until it's no longer in the S3 bucket (NEGLIGIBLY ZERO AND WILL NEVER HAPPEN BUT WE STILL GOTTA CHECK FOR IT #JAVASCRIPTLIFE #CODERLIFE #BIGCODES)
      tryagain++;
    }
    var fileStream = fs.createReadStream(path.basename("./public") + '/file-storage/' + fileName);
    fileStream.on('error', function (err) {
      console.log('File Error', err);
    });
    uploadParams.Body = fileStream;
    uploadParams.Key = UUID;
    // call S3 to retrieve upload file to specified bucket
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        console.log("Error", err);
      } if (data) {
        console.log("Upload Success", data.Location);
        //add file info to mongodb database
        try {
          var db = client.db('MYNOTES');
          var filesDB = db.collection('fileCol');
          console.log("adding file - " + fileName + " - to fileCol DB");
          //maxIDFile = filesDB.find().sort({ fileID: -1 }).limit(1).next(); // get the object of the file with the highest ID in the FILES collection
          var date = (new Date()).toISOString().split('T')[0];
          //var tag = "";
          filesDB.insertOne({ userID: ssn.userID, courseID: Number(req.body.uploadCourseID), filename: fileName, filetype: fileName.split('.')[1], dateAdded: date, UUID: UUID, tag: req.body.platform }, function (err) {
            if (err) { res.redirect("upload-error"); }
            else { res.redirect("upload-success"); }
          });
        } catch (e) {
          console.log(e);
        };
        //add to a user's notesRank
        try {
          console.log("Trying to add points to notesRank for userID: " + ssn.userID);
          var usersDB = db.collection('userCol');
          /*var result = */usersDB.updateOne({ userID: userId }, { $inc: { notesRank: 1 } }, function (err, cursor) {
            if (err) reject(err);
            console.log("Did this work?");
          });

          //console.log(result);
        } catch (e) {
          console.log(e);
        }
        //remove file from local storage
        fs.unlink(path.basename("./public") + '/file-storage/' + fileName, function (err) {
          if (err) {
            console.log("Delete Error", err);
          } else {
            console.log("Deleted " + fileName + " from server storage.");
          }
        })
      }
    });
  }

  app.post('/downloadFile', async function (req, res) {
    downloadFile(req, res, req.body.UUID, req.body.fileName)
  });

  function downloadFile(req, res, UUID, fileName) {
    //var db = client.db('MYNOTES');
    //var filesDB = db.collection('fileCol');
    //var fileDoc = filesDB.findOne({ UUID: UUID });
    s3.getObject(
      { Bucket: "mynotesbucket", Key: UUID }, function (error, data) {
        if (error != null) {
          console.log("Failed to retrieve an object: " + error);
        } else {
          console.log("Loaded " + data.ContentLength + " bytes");
          // do something with data.Body
          //console.log("Here's the file: " + data);
          res.send(data);
        }
      }
    );
  }

  function generateUUID() {
    var date = (new Date()).toISOString();
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  };
  /////////////////////////////

  /*******
   * check if UUID is already not in S3
   ******/

  function checkForUUID(UUID) {
    var allKeys = [];
    s3.listObjects({ Bucket: 'mynotesbucket' }, function (err, data) {
      allKeys.push(data.Contents);
      if (data.IsTruncated)
        listAllKeys(data.NextMarker);
      else
        for (var x = 0; x < allKeys[0].length; x++) {
          if (allKeys[0][x].Key === UUID)
            return true;
        }
      return false;
    });
  }
}