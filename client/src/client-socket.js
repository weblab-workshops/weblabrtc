import socketIOClient from "socket.io-client";
import { post } from "./utilities";
import { connection } from "./webrtc/connection";

const endpoint = window.location.hostname + ":" + window.location.port;

export const socket = socketIOClient(endpoint);

socket.on("connect", () => {
  console.log(`SOCKET ID ${socket.id}`);

  post("/api/initsocket", { socketid: socket.id });
});

socket.on("signal-from-user", (data) => {
  // console.log(data);
  connection.handle_signal(data);
});

export const signal_user = (data) => {
  // console.log("SIGNALING USER!");
  // console.log(data);
  socket.emit("signal-user", data);
};
