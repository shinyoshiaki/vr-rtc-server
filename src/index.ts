import socketio from "socket.io";
import http from "http";

console.log("start");

const srv = new http.Server();
const io = socketio(srv);
srv.listen(process.env.PORT || 20000);

const roomList: { [key: string]: { hostId: string; guestId: string } } = {};

io.on("connection", socket => {
  console.log("connection");

  socket.on("create", (data: { roomId: string }) => {
    const { roomId } = data;
    console.log("create", roomId);
    roomList[roomId] = { hostId: socket.id, guestId: "" };
    console.log("roomList", roomList);
  });

  socket.on("connect", (data: { roomId: string }) => {
    const { roomId } = data;
    console.log("connected", roomId, socket.id);
    delete roomList[roomId];
    console.log("roomList", roomList);
    const { hostId, guestId } = roomList[roomId];
    io.sockets.sockets[hostId].disconnect();
    io.sockets.sockets[guestId].disconnect();
  });

  socket.on("join", (data: { roomId: string }) => {
    const { roomId } = data;
    if (Object.keys(roomList).includes(roomId)) {
      try {
        console.log("join", roomId);
        const room = roomList[roomId];
        room.guestId = socket.id;
        console.log("roomList", roomList);
        io.sockets.sockets[socket.id].emit("join", { room: roomId });
      } catch (error) {
        console.log(error);
      }
    }
  });

  socket.on("sdp", (data: { roomId: string; sdp: string }) => {
    try {
      const { roomId, sdp } = data;

      const room = roomList[roomId];
      if (socket.id === room.hostId) {
        if (io.sockets.sockets[room.guestId])
          io.sockets.sockets[room.guestId].emit("sdp", { sdp });
      } else {
        if (io.sockets.sockets[room.hostId])
          io.sockets.sockets[room.hostId].emit("sdp", { sdp });
      }
    } catch (error) {
      console.log(error);
    }
  });
});
