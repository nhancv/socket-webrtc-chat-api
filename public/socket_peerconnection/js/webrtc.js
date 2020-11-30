/*
 * MIT License
 *
 * Copyright (c) 2020 Nhan Cao
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

'use strict';
// https://github.com/webrtc/samples/tree/gh-pages/src/content/peerconnection/pc1
const clientIdP = document.getElementById('clientId');
const peerConnectionStatusP = document.getElementById('peerConnectionStatus');
const calleeIdInput = document.getElementById('calleeIdInput');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};

// @nhancv 3/30/20: Init state
calleeIdInput.disabled = false;
callButton.disabled = false;
hangupButton.disabled = true;

let startTime;
let localStream;
let peerConnection;

///////////////////////////////////////////////////
// Handle socket event
// Connected to socket server and enable start button, otherwise disable it
// Connect to server and receive an socket client id
// Prepare local media
// Create an offer and send a pair (callee id, offer description) to server
// Server will forward that offer description to callee via id
// Callee receive offer and generate answer and send a pair (caller id, answer description) to server
// Server will forward that answer description to caller id
// Caller receive answer, two peer continue exchange ice candidate information via socket server
//

const CLIENT_ID_EVENT = 'client-id-event';
const REQUEST_CALL_EVENT = 'request-call-event';
const CALL_ACCEPTED_EVENT = 'call-accepted-event';
const OFFER_EVENT = 'offer-event';
const ANSWER_EVENT = 'answer-event';
const ICE_CANDIDATE_EVENT = 'ice-candidate-event';
const SIGN_OUT_EVENT = 'sign-out-event';
const CALL_ERROR_EVENT = 'call-error-event';

let calleeId = null;
let currentClientId = 'guest_kxPQPjwksA27AMW3GiIhyT7K872jkv';
// let currentClientId = 'guest_VmfbNpjRuTS3hPF7r5CNEhxDQJQrLT';

let initLocalMedia = false;

const socket = io('http://127.0.0.1:3001', {
    transports: ['polling', 'websocket'],
    transportOptions: {
        polling: {
            extraHeaders: {
                Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJndWVzdF9reFBRUGp3a3NBMjdBTVczR2lJaHlUN0s4NzJqa3YiLCJpYXQiOjE2MDIwNjQwNzgsImV4cCI6MTYwMjE1MDQ3OH0.dM2WVEKvERS9rGrKoJPB4LRECcMSPM55OTrrqpk6R9o"
                // Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJndWVzdF9WbWZiTnBqUnVUUzNoUEY3cjVDTkVoeERRSlFyTFQiLCJpYXQiOjE2MDIwNjQxODEsImV4cCI6MTYwMjE1MDU4MX0.iHrEEiVFZN3sKB658JsW8WrrVjCFzyWe-N__evpcegU"
            }
        }
    }
});

socket.on('connect', function () {
    console.log('Connected');
    clientIdP.innerHTML = `Client ID: ${currentClientId}`;

    socket.on(REQUEST_CALL_EVENT, async ({from_id, user}) => {
        console.log(`[REQUEST_CALL_EVENT] Call request from ${from_id}`);

        emitAcceptCallEvent();
    });

    socket.on(CALL_ACCEPTED_EVENT, async ({from_id}) => {
        console.log(`[CALL_ACCEPTED_EVENT] Call accepted by ${from_id}`);
        createPeerConnection();
        try {
            console.log('CreateOffer start');
            const offer = await peerConnection.createOffer(offerOptions);
            await onCreateOfferSuccess(offer);
        } catch (e) {
            onCreateSessionDescriptionError(e);
        }
    });

    socket.on(OFFER_EVENT, async (description) => {
        const {from_id, user, data} = description;
        console.log(OFFER_EVENT, description);
        // Auto start get local media
        if (!initLocalMedia) {
            await loadLocalMedia();
        }

        // @nhancv 3/30/20: Create new PeerConnection
        console.log('Created remote peer connection object');
        createPeerConnection();

        // Set remote offer
        console.log('setRemoteDescription start');
        try {
            await peerConnection.setRemoteDescription(data);
            console.log(`setRemoteDescription complete`);
        } catch (e) {
            onSetSessionDescriptionError(e);
        }

        console.log(currentClientId + ' createAnswer start');
        // Since the 'remote' side has no media stream we need
        // to pass in the right constraints in order for it to
        // accept the incoming offer of audio and video.
        try {
            const answer = await peerConnection.createAnswer();
            await onCreateAnswerSuccess(answer);
            // @nhancv 3/30/20: Send answer to callee
            emitAnswerEvent(answer);
        } catch (e) {
            onCreateSessionDescriptionError(e);
        }
    });

    socket.on(ANSWER_EVENT, async (description) => {
        const {from_id, data} = description;
        console.log(ANSWER_EVENT, description);
        console.log('setRemoteDescription start');
        try {
            await peerConnection.setRemoteDescription(data);
            console.log(`setRemoteDescription complete`);
        } catch (e) {
            onSetSessionDescriptionError(e);
        }
    });

    socket.on(ICE_CANDIDATE_EVENT, async (candidate) => {
        const {from_id, data} = candidate;
        console.log(ICE_CANDIDATE_EVENT, candidate);
        try {
            await peerConnection.addIceCandidate(data);
            console.log(`peerConnection addIceCandidate success`);
        } catch (e) {
            onAddIceCandidateError(e);
        }
        console.log(`ICE candidate:\n${data ? data.candidate : '(null)'}`);
    });

    socket.on(SIGN_OUT_EVENT, async () => {
        console.log(`[SIGN_OUT_EVENT]`);
        hangup();
    });

    socket.on(CALL_ERROR_EVENT, async (msg) => {
        console.log(`[CALL_ERROR_EVENT]`, msg);
        hangup();
    });

    socket.on('exception', function (exception) {
        console.log('exception', exception);
    });

    socket.on('disconnect', function () {
        console.log('Disconnected');
        clientIdP.innerHTML = '';
    });
});

///////////////////////////////////////////////////

function emitRequestCallEvent(peerId) {
    if (socket && socket.connected) {
        socket.emit(REQUEST_CALL_EVENT, {peerId: peerId})
    }
}

function emitAcceptCallEvent() {
    if (socket && socket.connected) {
        socket.emit(CALL_ACCEPTED_EVENT)
    }
}

function emitOfferEvent(description) {
    if (socket && socket.connected) {
        socket.emit(OFFER_EVENT, {description: description})
    }
}

function emitAnswerEvent(description) {
    if (socket && socket.connected) {
        socket.emit(ANSWER_EVENT, {description: description})
    }
}

function emitIceCandidateEvent(isHost, candidate) {
    if (socket && socket.connected) {
        socket.emit(ICE_CANDIDATE_EVENT, {candidate: candidate})
    }
}

///////////////////////////////////////////////////

localVideo.addEventListener('loadedmetadata', function () {
    console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remoteVideo.addEventListener('loadedmetadata', function () {
    console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remoteVideo.addEventListener('resize', () => {
    console.log(`Remote video size changed to ${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`);
    // We'll use the first onsize callback as an indication that video has started
    // playing out.
    if (startTime) {
        const elapsedTime = window.performance.now() - startTime;
        console.log('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
        startTime = null;
    }
});

async function loadLocalMedia() {
    console.log('Requesting local stream');
    try {
        // Older browsers might not implement mediaDevices at all, so we set an empty object first
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        // Some browsers partially implement mediaDevices. We can't just assign an object
        // with getUserMedia as it would overwrite existing properties.
        // Here, we will just add the getUserMedia property if it's missing.
        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function (constraints) {

                // First get ahold of the legacy getUserMedia, if present
                let getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia;

                // Some browsers just don't implement it - return a rejected promise with an error
                // to keep a consistent interface
                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }

                // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
                return new Promise(function (resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }

        // const constraints = { audio: true, video: true };
        const constraints = {audio: true, video: {facingMode: "user"}};
        // const constraints = {audio: true, video: {facingMode: {exact: "environment"}}};
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Received local stream');
        localVideo.srcObject = stream;
        localStream = stream;
    } catch (e) {
        alert(`getUserMedia() error: ${e.message}`);
        console.error(e);
    }
    initLocalMedia = true;
}

function createPeerConnection() {
    startTime = window.performance.now();

    peerConnection = new RTCPeerConnection({});
    peerConnection.addEventListener('icecandidate', e => onIceCandidate(e));
    peerConnection.addEventListener('iceconnectionstatechange', e => onIceStateChange(e));
    peerConnection.addEventListener('track', gotRemoteStream);

    if (localStream) {
        const videoTracks = localStream.getVideoTracks();
        const audioTracks = localStream.getAudioTracks();
        if (videoTracks.length > 0) {
            console.log(`Using video device: ${videoTracks[0].label}`);
        }
        if (audioTracks.length > 0) {
            console.log(`Using audio device: ${audioTracks[0].label}`);
        }
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    }
    console.log('Added local stream');

}

function onCreateSessionDescriptionError(error) {
    console.log(`Failed to create session description: ${error.toString()}`);
}

async function onCreateOfferSuccess(desc) {
    console.log(`Offer from local`, desc);
    console.log('setLocalDescription start');
    try {
        await peerConnection.setLocalDescription(desc);
        console.log(`setLocalDescription complete`);
        // @nhancv 3/30/20: Send offer to callee
        emitOfferEvent(desc);
    } catch (e) {
        onSetSessionDescriptionError(e);
    }

}

function onSetSessionDescriptionError(error) {
    console.log(`Failed to set session description: ${error.toString()}`);
}

async function onCreateAnswerSuccess(desc) {
    console.log(`Answer from peer:`, desc);
    console.log('Peer setLocalDescription start');
    try {
        await peerConnection.setLocalDescription(desc);
        console.log(`peerConnection setLocalDescription complete`);

    } catch (e) {
        onSetSessionDescriptionError(e);
    }
}

async function onIceCandidate(event) {
    try {
        // @nhancv 3/30/20: Send ice Candidate
        emitIceCandidateEvent(!(calleeId == null), event.candidate);
        console.log(`peerConnection addIceCandidate success`);
    } catch (e) {
        onAddIceCandidateError(e);
    }
    console.log(`peerConnection ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
}

function onAddIceCandidateError(error) {
    console.log(`peerConnection failed to add ICE Candidate: ${error.toString()}`);
}

function onIceStateChange(event) {
    if (peerConnection) {
        // checking, connected, disconnected
        peerConnectionStatusP.innerHTML = peerConnection.iceConnectionState;
        console.log(`peerConnection ICE state: ${peerConnection.iceConnectionState}`);
        console.log('ICE state change event: ', event);
        if (peerConnection.iceConnectionState === 'disconnected') {
            peerConnection.close();
            peerConnection = null;
            remoteVideo.srcObject = null;
            hangup();
        } else if (peerConnection.iceConnectionState === 'connected') {
            // @nhancv 3/30/20: Update control state
            callButton.disabled = true;
            calleeIdInput.disabled = true;
            hangupButton.disabled = false;
        }
    }
}

function gotRemoteStream(e) {
    const remoteStream = e.streams[0];
    if (remoteVideo.srcObject !== remoteStream) {
        remoteVideo.srcObject = remoteStream;
        remoteStream.getTracks().forEach(track => peerConnection.addTrack(track, remoteStream));
        console.log('peerConnection received remote stream');
    }
}


///////////////////////////////////////////////////
callButton.addEventListener('click', call);
hangupButton.addEventListener('click', hangup);

async function call() {
    console.log('Starting call');
    // Init Local Media
    if (!initLocalMedia) {
        await loadLocalMedia();
    }

    // @nhancv 3/30/20: Save calleeID
    calleeId = calleeIdInput.value;

    // Send event
    emitRequestCallEvent(calleeId);

}

function hangup() {
    console.log('Ending call');
    try {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        calleeId = null;
        remoteVideo.srcObject = null;
        localVideo.srcObject = null;
        localStream = null;
        // Reset control state
        calleeIdInput.disabled = false;
        callButton.disabled = false;
        hangupButton.disabled = true;
        initLocalMedia = false;
    } catch (e) {
        console.error(e);
    }
}
