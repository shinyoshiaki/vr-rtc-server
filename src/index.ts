import socketio from "socket.io";
import http from "http";

const srv = new http.Server();
const io = socketio(srv);
srv.listen(process.env.PORT || 20000);

const roomList: { [key: string]: { hostId: string; guestId: string } } = {};

type roomObj = {
  roomId: string;
};

io.on("connection", socket => {
  socket.on("create", (data: roomObj) => {
    const { roomId } = data;
    roomList[roomId] = { hostId: socket.id, guestId: "" };
  });

  socket.on("check", (data: roomObj) => {
    const { roomId } = data;
    const exist = roomList[roomId];
    if (exist) {
      socket.emit("check", { result: true });
    } else {
      socket.emit("check", { result: false });
    }
  });

  socket.on("connect", (data: roomObj) => {
    try {
      const { roomId } = data;
      const { hostId, guestId } = roomList[roomId];
      delete roomList[roomId];
      io.sockets.sockets[hostId].disconnect();
      io.sockets.sockets[guestId].disconnect();
    } catch (error) {
      console.log({ error });
    }
  });

  socket.on("join", (data: roomObj) => {
    const { roomId } = data;
    if (Object.keys(roomList).includes(roomId)) {
      try {
        const room = roomList[roomId];
        room.guestId = socket.id;
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
