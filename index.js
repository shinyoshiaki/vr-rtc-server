const socketio = require("socket.io");
const http = require("http");

console.log("start");

const srv = http.Server();
const io = socketio(srv);
srv.listen(20000);

const roomList = {};

io.on("connection", socket => {
  console.log("connection");
  socket.on("create", data => {
    const roomId = data.room;
    console.log("create", roomId);
    roomList[roomId] = { hostId: socket.id, guestId: "" };
    console.log("roomList", roomList);
  });

  socket.on("join", data => {
    const roomId = data.room;
    if (Object.keys(roomList).includes(roomId)) {
      console.log("join", roomId);
      const room = roomList[roomId];
      room.guestId = socket.id;
      console.log("roomList", roomList);
      io.sockets.sockets[socket.id].emit("join", { room: roomId });
    }
  });

  socket.on("offer", data => {
    const roomId = data.room;
    const sdp = data.sdp;
    console.log("offer", roomId);
    const room = roomList[roomId];
    io.sockets.sockets[room.hostId].emit("offer", { sdp });
  });

  socket.on("answer", data => {
    const roomId = data.room;
    const sdp = data.sdp;
    console.log("answer", roomId);
    const room = roomList[roomId];
    io.sockets.sockets[room.guestId].emit("answer", { sdp });
  });

  socket.on("ice", data => {
    const roomId = data.room;
    const candidate = data.candidate;
    const sdpMline = data.sdpMline;
    const sdpMid = data.sdpMid;
    console.log("ice", roomId);
    const room = roomList[roomId];
    if (socket.id === room.hostId) {
      io.sockets.sockets[room.guestId].emit("ice", {
        candidate,
        sdpMline,
        sdpMid
      });
    } else {
      io.sockets.sockets[room.hostId].emit("ice", {
        candidate,
        sdpMline,
        sdpMid
      });
    }
  });
});
