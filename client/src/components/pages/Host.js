import React, { useState } from "react";

import { get, post } from "../../utilities";

const Host = ({}) => {
  const [code, setCode] = useState("");

  async function getCode() {
    post("/api/createRoom").then((data) => {
      console.log(data);
      setCode(data.room);
    });
  }

  return (
    <div>
      <button onClick={getCode}>Host</button>
      <h1>Host room code: {code}</h1>
    </div>
  );
};

export default Host;
