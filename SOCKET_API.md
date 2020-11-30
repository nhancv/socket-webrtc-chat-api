# Socket api

Require `Bearer` token to `Authorization` header

- Example
```
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
``` 

## Socket event
```javascript
// request call
const REQUEST_CALL_EVENT = 'request-call-event'; // server send-recv
// peer decline a call, forward event to host
const DECLINE_CALL_EVENT = 'decline-call-event'; // server send-recv
// peer decline a call, forward event to other peers
const DECLINE_CALL_PEER_EVENT = 'decline-call-peer-event'; // server send
// peer accept call
const CALL_ACCEPTED_EVENT = 'call-accepted-event'; // server send
// send broadcast event to other peers when one instance accepted call
const CALL_ACCEPTED_PEER_EVENT = 'call-accepted-peer-event'; // server send

// host send offer to client
const OFFER_EVENT = 'offer-event'; // server send-recv
// when host or peer already in another call
const OFFER_ERROR_EVENT = 'offer-error-event'; // server send
// peer accept call offer and send answer to host
const ANSWER_EVENT = 'answer-event'; // server send-recv
// host and peer exchange ice
const ICE_CANDIDATE_EVENT = 'ice-candidate-event'; // server send-recv
// when sign out the call
const SIGN_OUT_EVENT = 'sign-out-event'; // server send-recv
// when call error
const CALL_ERROR_EVENT = 'call-error-event'; // server send
// when call error
const MESSAGE_ERROR_EVENT = 'message-error-event'; // server send
// when A send message to B
const MESSAGE_EVENT = 'message-event';
// this event send to sender after receiver read message
const MESSAGE_READ_EVENT = 'message-read-event';
// this event send to sender after receiver received message
const MESSAGE_RECEIVED_EVENT = 'message-received-event';
// when A send typing event to B
const MESSAGE_TYPING_EVENT = 'message-typing-event';
// online list. When A connect to server, server will send all online A's friend
const ONLINE_LIST_EVENT = 'online-list-event';
// online. When A online, send to friend of A
const ONLINE_EVENT = 'online-event';
// offline. When A offline, send to friend of A
const OFFLINE_EVENT = 'offline-event';
// unauthorized
const UNAUTHORIZED_EVENT = 'unauthorized-event';
// blocked event
const BLOCKED_EVENT = 'blocked-event';
```

## Calling flow

```
   ┌──────────────┐               ┌──────────────────┐               ┌──────────────┐                      
   │              │               │                  │               │              │                      
   │     Host     │               │      Server      │               │     Peer     │                      
   │              │               │                  │               │              │                      
   └──────────────┘               └──────────────────┘               └──────────────┘                      
           │                                │                                │                             
┌ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ┐                    
           │    ┌────────────────────┐      │                                │                             
│          ├────┤ REQUEST_CALL_EVENT ├─────▶│                                │        │┌──────────────────┐
           │    └────────────────────┘      │    ┌────────────────────┐      │         │   Request call   │
│          │                                ├────┤ REQUEST_CALL_EVENT ├─────▶│        │└──────────────────┘
           │                                │    └────────────────────┘      │                             
└ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ┘                    
           │                                │                                │                             
           │                                │                                │                             
┌ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ┐                    
           │                                │    ┌────────────────────┐      │                             
│          │                                │◀───┤ DECLINE_CALL_EVENT ├──────┤        │┌──────────────────┐
           │    ┌────────────────────┐      │    └────────────────────┘      │         │   Decline call   │
│          │◀───┤ DECLINE_CALL_EVENT ├──────┤                                │        │└──────────────────┘
           │    └────────────────────┘      │                                │                             
└ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ┘                    
           │                                │                                │                             
           │                                │                                │                             
┌ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ┐                    
           │                                │    ┌────────────────────┐      │                             
│          │                                │◀───┤CALL_ACCEPTED_EVENT ├──────┤        │                    
           │    ┌────────────────────┐      │    └────────────────────┘      │         ┌──────────────────┐
│          │◀───┤CALL_ACCEPTED_EVENT ├──────┤                                │        ││   Accept call    │
           │    └────────────────────┘      │                                │         └──────────────────┘
│          │    ┌────────────────────┐      │                                │        │                    
           ├────┤    OFFER_EVENT     ├─────▶│                                │                             
│          │    └────────────────────┘      │    ┌────────────────────┐      │        │                    
           │                                ├────┤    OFFER_EVENT     ├─────▶│                             
│          │                                │    └────────────────────┘      │        │                    
           │                                │    ┌────────────────────┐      │                             
│          │                                │◀───┤    ANSWER_EVENT    ├──────┤        │                    
           │    ┌────────────────────┐      │    └────────────────────┘      │                             
│          │◀───┤    ANSWER_EVENT    ├──────┤                                │        │                    
           │    └────────────────────┘      │                                │                             
│          │    ┌────────────────────┐      │                                │        │                    
           ├────┤ICE_CANDIDATE_EVENT ├─────▶│                                │                             
│          │    └────────────────────┘      │    ┌────────────────────┐      │        │                    
           │                                ├────┤ICE_CANDIDATE_EVENT ├─────▶│                             
│          │                                │    └────────────────────┘      │        │                    
           │                                │    ┌────────────────────┐      │                             
│          │                                │◀───┤ICE_CANDIDATE_EVENT ├──────┤        │                    
           │    ┌────────────────────┐      │    └────────────────────┘      │                             
│          │◀───┤ICE_CANDIDATE_EVENT ├──────┤                                │        │                    
           │    └────────────────────┘      │                                │                             
│          │                                │                                │        │                    
           │                                │                                │                             
│          ├────────────────────────────────┴────────────────────────────────┤        │                    
           │                         Media streaming                         │                             
│          ├────────────────────────────────┬────────────────────────────────┤        │                    
           │                                │                                │                             
└ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ┘                    
           │                                │                                │                             
           │                                │                                │                             
┌ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ┐                    
           │                                │    ┌────────────────────┐      │         ┌──────────────────┐
│          │                                │◀───┤   SIGN_OUT_EVENT   ├──────┤        ││     Signout      │
           │    ┌────────────────────┐      │    └────────────────────┘      │         │(can emit from any│
│          │◀───┤   SIGN_OUT_EVENT   ├──────┤                                │        ││side host or peer)│
           │    └────────────────────┘      │                                │         └──────────────────┘
└ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ┘                    
           │                                │                                │                             
           ▼                                ▼                                ▼                                                     
```
### Event detail
- Listen error event
```
Event: CALL_ERROR_EVENT
Response messages: 
- Incase REQUEST_CALL_EVENT
onRequestCall: Host[${hostId}] already in call
onRequestCall: Peer[${peerId}] already in call
onRequestCall: Peer was not found

- Incase DECLINE_CALL_EVENT
onCallAcceptedEvent: Peer was not found
onCallAcceptedEvent: Host was not found

- Incase CALL_ACCEPTED_EVENT
onCallAcceptedEvent: Peer was not found
onCallAcceptedEvent: Host was not found

- Incase OFFER_EVENT
onOfferEvent: Host was not found
onOfferEvent: Peer was not found
onAnswerEvent: Host was not found

- Incase ANSWER_EVENT
onAnswerEvent: Peer was not found
onAnswerEvent: Host was not found

- Incase ICE_CANDIDATE_EVENT
onIceCandidateEvent: Host && Peer was not found
onIceCandidateEvent: Peer was not found

- Incase SIGN_OUT_EVENT
onSignOutEvent: Peer was not found
```

- Request a new call
```
Event: REQUEST_CALL_EVENT
Body: { peerId: string }
Repsonse: 
{
    from_id: hostId <string>,
    user: host <RelationshipDto>
}
```

- Decline call
```
Event: DECLINE_CALL_EVENT
Body: empty
Repsonse: 
{
    from_id: peerId <string>
}
```

- Accept call
```
Event: CALL_ACCEPTED_EVENT
Body: empty
Repsonse: 
{
    from_id: hostId <string>
}
```

- Offer send
```
Event: OFFER_EVENT
Body: { description: any }
Repsonse: 
{
    from_id: hostId <string>,
    data: description
}
```

- Answer send
```
Event: ANSWER_EVENT
Body: { description: any }
Repsonse: 
{
    from_id: peerId <string>,
    data: description
}
```

- ICE Candidate send
```
Event: ICE_CANDIDATE_EVENT
Body: { candidate: any }
Repsonse: 
{
    from_id: userId <string>,
    data: candidate
}
```

- Sign out
```
Event: SIGN_OUT_EVENT
Body: empty
Repsonse: 
{
    from_id: hostId <string>,
    data: description
}
```

## Message flow
- Send typing
```
Event: MESSAGE_TYPING_EVENT
Body: { peerId: string, deviceId: string, body: 'typing' <string> }
Repsonse: 
{
    from_id: hostId <string>,
    user: host <RelationshipDto>,
    data: 'typing' <string>
}
```

- Send message
```
Event: MESSAGE_EVENT
Body: { peerId: string, deviceId: string, body: string }
Message body is string with JSON format:
    const text = {"type": "text", "value": "text value"}
    const file = {"type": "file", "value": {"original": "https://abc.com"}}
    const image = {"type": "image", "value": {"original": "https://abc.com", "preview": "https://abc.com", "size": "200x500"}}
Repsonse: 
{
    from_id: hostId <string>,
    user: host <RelationshipDto>,
    data: body <"{\"type\":\"text\",\"value\":\"hello\"}">
}
```
