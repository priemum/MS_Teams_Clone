const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;     //mutes our video for ourselves, since we don't want to listen to our own video

// A prompt which asks for users' username
let myName;
do{
  myName = prompt('Please enter your username: ')
}
while(!myName)

var peer=new Peer(undefined);
let peers = {}, currentPeer = [];

let myVideoStream;

navigator.mediaDevices.getUserMedia({   //by using this we can access user device media(audio, video)
    video: true,    
    audio: true
}).then(stream => {                     //in this promise we sent media in stream
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })

        currentPeer.push(call.peerConnection);

    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream)
    })
})

// random 'id' for any user automatically generated using peer
peer.on('open' , id => {
    socket.emit('join-room', ROOM_ID, id)
})

// when a user leaves the meeting
socket.on('user-disconnected', userId => {
  if (peers[userId]) 
    peers[userId].close()
})


// calling the new user with (userId) and sending our current stream to him
const connectToNewUser = (userId, stream) => {     
    const call = peer.call(userId, stream)  
    const video = document.createElement('video') 
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream) // creates vid for new user & adds that video on screen
    })

    call.on('close', () => {
      video.remove()
      delete peers[userId]
    })
  
    peers[userId] = call
    currentPeer.push(call.peerConnection);    
    console.log(currentPeer);
}

// function to add a video element in video-grid for the given stream
function addVideoStream(video, stream){       
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    video.setAttribute("controls", "");     //adding controls in the video element
    videoGrid.append(video)
}





//For calculating the time for which each individual stays in a meeting-room
let sessionTime = document.getElementById("sessionTime");
let mySessionTime = document.createElement("p");

mySessionTime.setAttribute("id", "sessionTime");

startCountTime();

function startCountTime() {
  let callStartTime = Date.now();
  setInterval(function printTime() {
    let callElapsedTime = Date.now() - callStartTime;
    sessionTime.innerHTML = getTimeToString(callElapsedTime);
  }, 1000);
}

function getTimeToString(time) {
  let diffInHrs = time / 3600000;
  let hh = Math.floor(diffInHrs);
  let diffInMin = (diffInHrs - hh) * 60;
  let mm = Math.floor(diffInMin);
  let diffInSec = (diffInMin - mm) * 60;
  let ss = Math.floor(diffInSec);
  let new_hh = hh.toString().padStart(2, "0");  
  let new_mm = mm.toString().padStart(2, "0");
  let new_ss = ss.toString().padStart(2, "0");
  return `${new_hh}:${new_mm}:${new_ss}`;
}





// When the "Video-Camera" button is clicked
function vidCamera(){
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {                                          // if my video is visible, hide my video
    myVideoStream.getVideoTracks()[0].enabled = false;
    showMe()
  } else {
    hideMe()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

// Functions to toggle "Video-Camera" buttons
function showMe(){        //when my video is off
  document.querySelector('.myVidButton').setAttribute("title", "Play Video");  
  const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `
  document.querySelector('.myVidButton').innerHTML = html;
}

function hideMe(){        //when my video is on
  document.querySelector('.myVidButton').setAttribute("title", "Hide Video");
  const html = `
    <i class="fas fa-video"></i>
    <span>Hide Video</span>
  `
  document.querySelector('.myVidButton').innerHTML = html;
}





// When the "Audio-Microphone" button is clicked
function myAudio(){
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {                                              // if I am already unmuted
    myVideoStream.getAudioTracks()[0].enabled = false;
    unmuteMe();
  } else {
    muteMe();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

function muteMe(){              //when my mic is on
  document.querySelector('.myMuteButton').setAttribute("title", "Mute");
  const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
  document.querySelector('.myMuteButton').innerHTML = html;
}
  
function unmuteMe() {           //when my mic is off
  document.querySelector('.myMuteButton').setAttribute("title", "Unmute");  
  const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
  document.querySelector('.myMuteButton').innerHTML = html;
}





// When the "Screen-Share" button is clicked
let screenShareButton=document.getElementById("share-screen");
let isScreenSharing=false;

screenShareButton.addEventListener( 'click', ( e ) => {
  if (isScreenSharing==false) {
    screenShare();
  }
  else {
    disableBtn();
  }
} );

function screenShare(){
  navigator.mediaDevices.getDisplayMedia({
  video:{
    cursor:'always'
  },
  audio:{
    echoCancellation:true,
    noiseSupprission:true
  }
  }).then(stream => {

    isScreenSharing=true;
    markActive();

    let videoTrack = stream.getVideoTracks()[0];
    videoTrack.onended = function(){
      stopScreenShare();
    }
    for (let x=0;x<currentPeer.length;x++){
      let sender = currentPeer[x].getSenders().find(function(s){  
          return s.track.kind == videoTrack.kind;
        })
        
        sender.replaceTrack(videoTrack);    //replace my video with my screen for other users 
    }
  })  
  }
  
function stopScreenShare(){
  let videoTrack = myVideoStream.getVideoTracks()[0];
  for (let x=0 ; x<currentPeer.length ; x++){
    let sender = currentPeer[x].getSenders().find(function(s){
      return s.track.kind == videoTrack.kind;
    })
    sender.replaceTrack(videoTrack);
  }
  isScreenSharing=false;
  markInactive();
}

function disableBtn() {   // the button gets diabled to prevent any hinderance while sharing the screen
  screenShareButton.disabled = true;
}

function markActive() {               //while screen is getting shared - the button looks active
  screenShareButton.setAttribute( 'title', 'Your screen is shared' );
  const html = `
      <i class="fas fa-share-square screenIsSharing"></i>
      <span class="screenIsSharing" >Share Screen</span>
  `
  screenShareButton.innerHTML = html;
}

function markInactive(){              //button gets back to normal when screen sharing is stopped
  screenShareButton.setAttribute( 'title', '' );
  const html = `
  <i class="fas fa-share-square"></i>
  <span>Share Screen</span>
  `
  screenShareButton.innerHTML = html;
}





// When the "Chat" button is clicked
function ShowChat(e){
  document.body.classList.toggle("showChat");
};

let textarea = document.querySelector('#chat_message')
let messageArea = document.querySelector('.chatsDisplayArea')

textarea.addEventListener('keyup', (e) => {
  if(e.key === 'Enter' && e.target.value.length!=0) {
    sendMyMsg(e.target.value)
  }
})

function sendButton(){            // when the plane button is clicked
  let text=document.getElementById("chat_message").value;
  if(text.length!=0){
    sendMyMsg(text)
  } 
}

function sendMyMsg(message) {
  let time = getFormatDate(new Date());
  let msg = {
      user: myName,
      time: time,
      message: message
  }
  // Append 
  appendMessage(msg, 'outgoing')
  textarea.value = ''
  scrollToBottom()

  // Send to server 
  socket.emit('message', msg)
}

function appendMessage(msg, type) {
  let mainDiv = document.createElement('div')
  let className = type
  mainDiv.classList.add(className, 'message')

  const html = `
      <div class=msgHead">
        <span class="name">${msg.user}</span>
        <span class="msgTime">${msg.time}</span>
      </div>
      <p class="text">${msg.message}</p>
  `
  mainDiv.innerHTML = html;
  messageArea.appendChild(mainDiv)
}

socket.on('message', (msg) => {
  appendMessage(msg, 'incoming')
  scrollToBottom()
})

function scrollToBottom() {
  messageArea.scrollTop = messageArea.scrollHeight
}

// message time-stamp
function getFormatDate(date) {
  const time = date.toTimeString().split(" ")[0];
  return `${time}`;
}





//  When the "Invite" button is clicked to send invites to other people for the meeting
var modal = document.getElementById("myModal");
var inviteBtn = document.getElementById("myBtn");
var span = document.getElementsByClassName("close")[0]; // <span> element that closes the modal

inviteBtn.onclick = function() {    //opens modal
  modal.style.display = "block";
}

span.onclick = function() {        // closes modal
  modal.style.display = "none";
}

window.onclick = function(event) {  // if clicked anywhere outside of the modal, close modal
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// inside the modal
let myUrl=window.location.href;
document.querySelector("input.text").value=myUrl;

function copyLink(){              // function to copy meeting URL displayed in the modal
  let copyText = document.querySelector(".copyMeetLink");
  let input = copyText.querySelector("input.text");
  input.select();
  document.execCommand("copy");
  copyText.classList.add("active");
  window.getSelection().removeAllRanges();
  setTimeout(function(){
    copyText.classList.remove("active");
  },2000);
};


