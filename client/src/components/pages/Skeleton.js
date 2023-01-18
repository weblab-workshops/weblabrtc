import React from "react";

import "../../utilities.css";
import Host from "./Host";
import Join from "./Join";
import Chat from "./chat/Chat";
import "./Skeleton.css";
import VideoChat from "./videochat/VideoChat";

const Skeleton = ({ userId, handleLogin, handleLogout }) => {
  return userId ? (
    <div>
      <Host></Host>
      <Join></Join>
      <Chat></Chat>

      <VideoChat></VideoChat>
    </div>
  ) : (
    <div></div>
  );
};

export default Skeleton;
