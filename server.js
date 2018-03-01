const express = require("express");
const app = express();
const morgan = require("morgan");
app.use(morgan("dev"));
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cors = require("cors");

app.use(cors());

app.get("/", function(req, res) {
  res.send("Welcome Slack-like");
});

io.on("connection", client => {
  client.on("subscribeToTimer", interval => {
    console.log("client is subscribing to timer with interval ", interval);
    setInterval(() => {
      client.emit("timer", new Date());
    }, interval);
  });
  client.on("userConnection", user => {
    console.log("Connection of : ", user);
  });
});

const port = 3001;

server.listen(port, function() {
  console.log("listening on port :", port);
});
