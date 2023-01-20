import adapter from "webrtc-adapter";

console.log(adapter.browserDetails.browser);

import { rtcConfiguration } from "./configuration";
import { signal_user } from "../client-socket";

const receive_message = (event) => {
  connection.handleMessage(JSON.parse(event.data));
};

class RTCConnection {
  constructor() {
    this.peer_id = null;
    this.peerConnection = null;
    this.dataChannel = null;
    this.isHost = null;
  }

  start(iceServers, peer_id, isHost) {
    if (peer_id != null) this.peer_id = peer_id;

    this.peerConnection = new RTCPeerConnection(iceServers);

    this.peerConnection.onicecandidate = (event) => {
      console.log("FOUND ICE CANDIDATE!");
      if (event.candidate != null) {
        signal_user({
          to: peer_id,
          ice: event.candidate,
        });
      }
    };

    if (isHost) {
      this.isHost = isHost;
      this.peerConnection.ondatachannel = (event) => {
        console.log("open data channel");
        this.dataChannel = event.channel;
        this.setupDataChannel();
      };
    } else {
      this.isHost = isHost;
      this.peerConnection.onnegotiationneeded = async () => {
        const offer = await this.peerConnection.createOffer({
          offerToReceiveAudio: 1,
          offerToReceiveVideo: 1,
        });
        await this.localDescCreated(offer);
      };

      this.dataChannel = this.peerConnection.createDataChannel("channel");
      this.setupDataChannel();
    }

    this.peerConnection.ontrack = (event) => {
      console.log(`TRACK EVENT! with  ${event.streams.length} streams ${this.peer_id}`);

      if (connection.remoteStreams[this.peer_id] === undefined) {
        connection.remoteStreams[this.peer_id] = event.streams[0];
        connection.eventTarget.dispatchEvent(new CustomEvent("new-video", { detail: event.streams[0] }));
      }
    };
  }

  setupDataChannel() {
    this.dataChannel.onopen = () => console.log(`Connected to peer ${this.peer_id}`);
    this.dataChannel.onclose = () => console.log(`Disconnected to peer ${this.peer_id}`);
    this.dataChannel.onmessage = receive_message;
    this.peerConnection.onconnectionstatechange = () =>
      console.log(`Something changed in peer ${this.peer_id}`);
  }

  async localDescCreated(desc) {
    await this.peerConnection.setLocalDescription(desc);
    signal_user({
      to: this.peer_id,
      sdp: this.peerConnection.localDescription,
    });
  }

  async handle_signal(data) {
    if (this.peerConnection == null || data.from == null) return;

    if (data.ice) {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(data.ice));
    } else if (data.sdp) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      if (this.peerConnection.remoteDescription.type === "offer") {
        const offer = await this.peerConnection.createAnswer();
        await this.localDescCreated(offer);
      }
    }
  }

  //assumes message is already a string
  send(message) {
    if (this.dataChannel == null || this.dataChannel.readyState !== "open") return;
    this.dataChannel.send(message);
  }
}

export const connection = {
  eventTarget: new EventTarget(),
  peers: {},
  stream: null,
  remoteStreams: {},

  handle_signal(data) {
    if (!data.from) return;

    if (!this.peers[data.from]) {
      // Create a new RTCConnection object
      const newConn = new RTCConnection();
      this.peers[data.from] = newConn;
      newConn.start(rtcConfiguration, data.from, true);

      if (this.stream != null) {
        this.stream
          .getTracks()
          .forEach((track) => newConn.peerConnection.addTrack(track, this.stream));
      }
    }

    this.peers[data.from].handle_signal(data);
  },

  connect_to_peers(sockets) {
    sockets.forEach((socket) => {
      console.log(`connect_to_peers ${socket}`);

      const newConn = new RTCConnection();
      this.peers[socket] = newConn;
      newConn.start(rtcConfiguration, socket, false);

      if (this.stream != null) {
        this.stream
          .getTracks()
          .forEach((track) => newConn.peerConnection.addTrack(track, this.stream));
      }
    });
  },

  handleMessage(data) {
    console.log("Received data:");
    console.log(data);

    if (data.type === "chat") {
      const event = new CustomEvent("chat", { detail: data });
      this.eventTarget.dispatchEvent(event);
    }
  },

  send(data) {
    data = JSON.stringify(data);
    Object.values(this.peers).forEach((peer) => peer.send(data));
  },
};
