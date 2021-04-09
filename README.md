# MyNotes - Cloud Computing Final Project


MyNotes is a web application created by students for students. It was created with the idea of allowing students to colloborate more effectively about course content with the additional feature of being able to organize under courses, upload/download files, and finally message other users instantly. 

## Getting Started

Simply visit the following website: https://uoit-mynotes.herokuapp.com/ 

### Prerequisites

The web application is hosted entirely on the cloud. The only prerequisite is to have a functional modern web browser.

## User Registration and Signup

Upon first visit, you are greeted by a log in screen. This screen requires the user to enter login credentials. On the first visit, users will have to navigate to the 
Registration page using a link located in the header of the page. In the registration screen, users will be allowed to register their credentials and can then proceed to login to the website. 

**SCREENSHOT NEEDED**

## Home Page Screen

After successful login, users are redirected to the home page. This home page is the central page of the entire web application. It is divided into three parts for the users benefit. The first segment is the Chat Room on the very left, followed by the Currently Enrolled Courses in the middle, and finally, Joinable Courses on the right. 

**SCREENSHOT NEEDED**

### Joinable Courses

The joinable courses segment is a list of available courses the users can join. There is a join button beside every course name and once the user joins a course, the course will refresh in the list of Currently Enrolled courses.

### Currently Enrolled Courses

The currently enrolled segment is a list of coures the user is already in. There is a leave button beside every course name and once the user leaves a course, the course will refresh in the list of Joinable courses.

### Chat Room

The Chat Room is an instant messaging feature for all users to be able to communicate instantly. This feature consists of a chat room for each course. This can be specified through the use of the drop down menu at the top of the segment. Messages in chat sent by the user are featured in blue on the right hand side of the segment, and other users' messages are displayed on the left hand side in grey. All messages display information at the bottom such as username of the user who sent the message, time and date. The users' names are displayed with a different colour in the chat rooms depending on their independent Notes Ranks. 


## Profile Page

Every single user who registers in the website is given their own profile. The profile contains the username and general information about the user including the user's Notes Rank at the top of the page. The page also has two other sections: Currently Enrolled Courses (a list of courses the user is currently enrolled in) and Recently Uploaded Files (a list of files the user had recently uploaded). 

### Notes Rank

Notes Rank is a ranking system that denotes the number of uploads a user has performed. It increments by 1 per upload and the ranking system is as follows:
  - Score of 10 or less: grey
  - Score of less than 20 or greater than 11: blue
  - Score of 21 or greater: gold/black

**SCREENSHOT NEEDED**

## Courses Page

The Course page consists of three main sections: Course Members, Course Files, and File Upload. The Course Members is simply a list of the currently enrolled members within that course and their respective User ID. The Course Files are a list of files that have been uploaded to the course, the date they were uploaded and a Tag. Each file name is clickable and can be downloaded on click, however only by users who have joined the course. The File Upload section is an area where users can upload a file to the course. Users can choose the file by pressing the prompt which will open their operating system's file explorer, and then they can select the file from there. This section additionally has a tag field, which has three options: Core, Supplemental and Assistance. This is a tag to denote which category the uploaded file should be categorized by. 

**SCREENSHOT NEEDED**
