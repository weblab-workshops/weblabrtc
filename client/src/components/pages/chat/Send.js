import React, { useState } from "react";

import { connection } from "../../../webrtc/connection";

const Send = ({ newMessage }) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function nameChange(event) {
    setName(event.target.value);
  }

  function messageChange(event) {
    setMessage(event.target.value);
  }

  function send() {
    connection.send({
      type: "chat",
      sender_name: name,
      message: message,
    });
  }

  function onKeyDown(event) {
    if (event.key === "Enter") {
      send();

      newMessage({
        sender_name: name,
        message: message,
        is_me: true,
      });
    }
  }

  return (
    <div>
      Name: <input onChange={nameChange} />
      Message: <input onChange={messageChange} onKeyDown={onKeyDown} />
    </div>
  );
};

export default Send;
