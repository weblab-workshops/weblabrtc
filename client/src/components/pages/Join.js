import { connection } from "../../webrtc/connection";
import React, { useState } from "react";

import { get, post } from "../../utilities";
import { socket } from "../../client-socket";

const Join = ({}) => {
  const [gameCode, setGameCode] = React.useState("");

  function textFieldChange(event) {
    setGameCode(event.target.value);
  }

  async function join() {
    post("/api/joinRoom", {
      room: gameCode,
      socketID: socket.id
    }).then((data) => {
      connection.connect_to_peers(data.sockets);
    });
  }

  function onKeyDown(event) {
    if (event.key === "Enter") {
      join();
    }
  }

  return (
    <div>
      <div>Room code:</div>
      <input onChange={textFieldChange} onKeyDown={onKeyDown} />

      <div>
        <button onClick={join}>Join</button>
      </div>
    </div>
  );
};

export default Join;
