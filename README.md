# Microsoft Teams Clone
This project was built as a part of [Microsoft Engage 2021](https://microsoft.acehacker.com/engage2021/)

## Table of Contents
1. [About](https://github.com/muskaanv0/MS_Teams_Clone#about)
2. [Key-features](https://github.com/muskaanv0/MS_Teams_Clone#key-features)
3. [Try the application yourself](https://github.com/muskaanv0/MS_Teams_Clone#try-the-application-yourself)
4. [Tools and Technologies used](https://github.com/muskaanv0/MS_Teams_Clone#tools-and-technologies-used)
5. [Run in your local system](https://github.com/muskaanv0/MS_Teams_Clone#run-in-your-local-system)
6. [Deployment](https://github.com/muskaanv0/MS_Teams_Clone#deployment)

## About
- Real-time video calling application that creates rooms for meetings,  provides quick `peer-to-peer` connectivity, and supports various in-call features. 
- How principles of Agile Methodology were used during this 4-week sprint - [Check here](https://drive.google.com/file/d/1tajH7qIWzjEBVpKkLsZorPewsdYaKKRw/view?usp=sharing)

## Key-features
* Toggle Video - to hide and show own video
* Toggle Audio - to mute and unmute own audio  
* Supports more than two participants in one room
* Easy to use - no download, plug-in, or login required
* Get conference rooms without any limit on the call duration
* Get sharable meeting invites to share with people you want in the room
* Screen Share Option - allows user to present his own screen to other participants 
* Real-Time Chat - supports participants to have chat conversation during the call
* Session Timer - counts the amount of time for which a user stays in the meeting room
* Total Privacy - the app collects no data or personal information so it stays just between the participants

## Try the application yourself 
- Visit [here](https://ms-teams-videocall-mv.herokuapp.com)
- `Create` a meeting room, and `share` the invite with the people you want!

## Tools and Technologies used
- Node.js
- Express
- WebRTC
- Socket.IO
- EJS
 

## Run in your local system
#### Requirements
- You will require `Node.js` to be installed on your machine. Check the [official Node.js website](https://nodejs.org/) to download the installer.
- Also, be sure to have `git` available in your PATH, `npm` might need it (find git [here](https://git-scm.com/)). 

#### After having the requirements all set, open your terminal
* Clone the repository - `git clone https://github.com/muskaanv0/MS_Teams_Clone.git`
* Navigate to the folder - `cd MS_Teams_Clone`
* Run to install the project dependencies-
```
npm install
npm install -g nodemon
nodemon server.js
```

- Open `http://localhost:3030` in browser to view on port 3030.

## Deployment
- You can deploy the app on [Heroku](www.heroku.com)
- Run-
```
heroku login
git add .
git commit -am "make it better"
git push heroku master
```
