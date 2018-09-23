const client = require("socket.io-client");

const socket = client.connect("https://serene-anchorage-28732.herokuapp.com/");

socket.on("connect", () => {
  console.log("connected");
});
