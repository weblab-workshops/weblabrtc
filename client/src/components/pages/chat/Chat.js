import React, { useState, useEffect } from "react";
import { connection } from "../../../webrtc/connection";
import Messages from "./Messages";
import Send from "./Send";

const Chat = ({}) => {
  const [messages, setMessages] = useState([]);

  const newMessage = (message) => {
    setMessages((oldMessages) => [...oldMessages, message]);
  };

  const newChatMessage = (event) => {
    newMessage(event.detail);
  };

  useEffect(() => {
    connection.eventTarget.addEventListener("chat", newChatMessage);

    return () => {
      connection.eventTarget.removeEventListener("chat", newChatMessage);
    };
  }, []);

  return (
    <div>
      <Send newMessage={newMessage}></Send>
      <Messages messages={messages}></Messages>
    </div>
  );
};

export default Chat;
