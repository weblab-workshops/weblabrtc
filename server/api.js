/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");
const uuid = require("uuid");

// import models so we can interact with the database
// const User = require("./models/user");

// import authentication library
const auth = require("./auth");
const util = require("./util");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");
const { joinRoom, getSocketFromUserID } = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);

router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in

    const user = {
      _id: uuid.v4(),
    };

    req.session.user = user;

    return res.send(user);
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user) {
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  }
  res.send({});
});

const socketToRoomMap = {}; // maps socketID to room
const roomToSocketsMap = {}; // maps room to list of socket IDs

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

router.post("/createRoom", (req, res) => {
  const socketID = req.body.socketID;
  if (socketID) {
    const newRoom = util.randomString(4);

    socketToRoomMap[socketID] = newRoom;
    roomToSocketsMap[newRoom] = [socketID];

    res.send({
      room: newRoom,
    });

    return;
  }

  res.send({});
});

router.post("/joinRoom", (req, res) => {
  const room = req.body.room;
  const socketID = req.body.socketID;
  if (room && socketID) {
    socketToRoomMap[socketID] = room;
    const currentSockets = [...roomToSocketsMap[room]];
    roomToSocketsMap[room].push(socketID);

    res.send({
      sockets: currentSockets,
    });

    return;
  }

  res.send({});
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
