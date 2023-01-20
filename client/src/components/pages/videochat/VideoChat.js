import React, { useEffect, useState } from "react";
import Video from "./Video";
import { connection } from "../../../webrtc/connection";

const VideoChat = ({}) => {
  const [localMediaStream, setLocalMediaStream] = useState(null);
  const [streams, setRemoteStreams] = useState([]);

  function handleSuccess(stream) {
    Object.entries(connection.peers).forEach((peer) => {
      console.log(peer);
      stream.getTracks().forEach((track) => peer.peerConnection.addTrack(track, stream));
    });

    connection.stream = stream;

    setLocalMediaStream(stream);
  }

  function newMediaStreams(event) {
    console.log("HELLO WORLD!");
    // console.log(connection.remoteStreams);
    setRemoteStreams((old) => {
      console.log(event.detail);
      return [...old, event.detail];
    });
  }

  useEffect(() => {
    const constraints = { video: true, audio: true };

    connection.eventTarget.addEventListener("new-video", newMediaStreams);

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(handleSuccess)
      .catch((error) => console.log(error));
    return () => {
      connection.eventTarget.removeEventListener("new-video", newMediaStreams);
    };
  }, []);

  return (
    <div>
      <Video mediaStream={localMediaStream} width={500} title="Me" playSound={false}></Video>
      {Object.values(streams).map((stream, i) => (
        <div key={i}>
          <Video mediaStream={stream} width={500} title="Meh" playSound={true}></Video>
        </div>
      ))}
    </div>
  );
};

export default VideoChat;
