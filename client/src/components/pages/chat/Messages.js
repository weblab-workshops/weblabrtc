import React, { useState } from "react";

const Message = ({ sender_name, message, is_me }) => {
  return (
    <div>
      (from: {sender_name}) {message}{" "}
    </div>
  );
};

const Messages = ({ messages }) => {
  return messages.map((item, val) => (
    <Message
      key={val}
      sender_name={item.sender_name}
      message={item.message}
      is_me={item.is_me}
    ></Message>
  ));
};

export default Messages;
