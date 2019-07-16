import client from "socket.io-client";
import WebRTC from "webrtc4me";

const url =
  process.env.NODE_ENV === "production"
    ? "https://aqueous-earth-75182.herokuapp.com/"
    : "http://localhost:20000";

const socket = client.connect(url);

export function create(roomId: string, trickle: boolean) {
  return new Promise<WebRTC>(resolve => {
    const rtc = new WebRTC({ nodeId: "answer", trickle });
    socket.emit("create", { roomId });
    socket.on("sdp", (data: { sdp: string }) => {
      console.log({ data });
      rtc.setSdp(data.sdp);
    });

    rtc.signal = sdp => {
      console.log({ sdp, roomId });
      socket.emit("sdp", { sdp, roomId });
    };
    rtc.connect = () => {
      console.log("connect");
      resolve(rtc);
    };
    rtc.onData.subscribe(message => {
      console.log({ message });
    });
  });
}

export function join(roomId: string, trickle: boolean) {
  return new Promise<WebRTC>(resolve => {
    const rtc = new WebRTC({ nodeId: "offer", trickle });
    socket.emit("join", { roomId });
    socket.on("join", () => {
      rtc.makeOffer();
    });
    socket.on("sdp", (data: { sdp: string }) => {
      console.log({ data });
      rtc.setSdp(data.sdp);
    });

    rtc.signal = sdp => {
      console.log({ sdp, roomId });
      socket.emit("sdp", { sdp, roomId });
    };
    rtc.connect = () => {
      console.log("connect");
      resolve(rtc);
    };
    rtc.onData.subscribe(message => {
      console.log({ message });
    });
  });
}
