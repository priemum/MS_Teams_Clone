const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

let myOwnId;
let myName;
do{
  myName = prompt('Please enter your name: ')
}
while(!myName)

//session time
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
  let formattedHH = hh.toString().padStart(2, "0");
  let formattedMM = mm.toString().padStart(2, "0");
  let formattedSS = ss.toString().padStart(2, "0");
  return `${formattedHH}:${formattedMM}:${formattedSS}`;
}

 
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
        // console.log('two');
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })

        currentPeer.push(call.peerConnection);
        const len=currentPeer.length
        console.log(len);

        call.on('close', function(){    // Handle when the call finishes
          video.remove();
          alert("The videocall has finished");
        });

    })

    socket.on('user-connected', (userId) => {
        myOwnId = userId
        connectToNewUser(userId, stream)
    })
})

// random 'id' automatically generated using peer
peer.on('open' , id => {
    // console.log(id);
    socket.emit('join-room', ROOM_ID, id)
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) 
    peers[userId].close()
})

// tells a new user has connected and shows his user-id
// sending userid along w user stream // creating vid for new user // add that vid on screen
const connectToNewUser = (userId, stream) => {
    // console.log(userId)  
    const call = peer.call(userId, stream)
    const video = document.createElement('video') 
    call.on('stream', userVideoStream => {
        // console.log('one')
        addVideoStream(video, userVideoStream)
    })

    call.on('close', () => {
      video.remove()
    })
  
    peers[userId] = call
    currentPeer.push(call.peerConnection);    // other members apart from host
    console.log(currentPeer);
}

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    videoGrid.append(video)
}

// Video-Camera
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

function showMe(){
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `
    document.querySelector('.myVidButton').innerHTML = html;
}

function hideMe(){
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.myVidButton').innerHTML = html;
}



// Audio-Microphone
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

function muteMe(){
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.myMuteButton').innerHTML = html;
}
  
function unmuteMe() {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.myMuteButton').innerHTML = html;
}

function ShowChat(e){
  // e.classList.toggle("active");
  document.body.classList.toggle("showChat");
};



// Screen Sharing 

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

    // myVideoStream=stream;

    let videoTrack = stream.getVideoTracks()[0];
    videoTrack.onended = function(){
      stopScreenShare();
    }
    for (let x=0;x<currentPeer.length;x++){
      let sender = currentPeer[x].getSenders().find(function(s){  //replace video track 
          return s.track.kind == videoTrack.kind;
        })
        
        sender.replaceTrack(videoTrack);
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

function disableBtn() {
  screenShareButton.disabled = true;
}

function markActive() {     //while screen is getting shared
  screenShareButton.setAttribute( 'title', 'Your screen is shared' );
  const html = `
      <i class="fas fa-share-square screenIsSharing"></i>
      <span class="screenIsSharing" >Share Screen</span>
  `
  screenShareButton.innerHTML = html;
}

function markInactive(){    //back to normal when screen sharing is stopped
  screenShareButton.setAttribute( 'title', '' );
  const html = `
  <i class="fas fa-share-square"></i>
  <span>Share Screen</span>
  `
  screenShareButton.innerHTML = html;
}


// Leave Call
// function leaveCall(){
//   socket.emit('user-disconnected', myOwnId);
// }

let textarea = document.querySelector('#chat_message')
let messageArea = document.querySelector('.chatsDisplayArea')

textarea.addEventListener('keyup', (e) => {
  if(e.key === 'Enter' && e.target.value.length!=0) {
    sendMyMsg(e.target.value)
  }
})

function sendButton(){
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

  let markup = `
      <div class=msgHead">
        <span class="name">${msg.user}</span>
        <span class="msgTime">${msg.time}</span>
      </div>
      <p class="text">${msg.message}</p>
  `
  mainDiv.innerHTML = markup
  messageArea.appendChild(mainDiv)
}

socket.on('message', (msg) => {
  appendMessage(msg, 'incoming')
  scrollToBottom()
})

function scrollToBottom() {
  messageArea.scrollTop = messageArea.scrollHeight
}

// message-time
function getFormatDate(date) {
  const time = date.toTimeString().split(" ")[0];
  return `${time}`;
}





//  invite other people for the meeting

var modal = document.getElementById("myModal");
var inviteBtn = document.getElementById("myBtn");
var span = document.getElementsByClassName("close")[0]; // <span> element that closes the modal

inviteBtn.onclick = function() {    //open modal
  modal.style.display = "block";
}

span.onclick = function() {        // close modal
  modal.style.display = "none";
}

window.onclick = function(event) {  // if clicked anywhere outside of the modal, close it
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// inside modal

let myUrl=window.location.href;
document.querySelector("input.text").value=myUrl;

function copyLink(){
  let copyText = document.querySelector(".copy-text");
  let input = copyText.querySelector("input.text");
  input.select();
  document.execCommand("copy");
  copyText.classList.add("active");
  window.getSelection().removeAllRanges();
  setTimeout(function(){
    copyText.classList.remove("active");
  },2500);
};


