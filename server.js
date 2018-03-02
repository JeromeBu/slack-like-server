const express = require("express");
const app = express();
const morgan = require("morgan");
app.use(morgan("dev"));
var mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/slack-like"
);
const User = require("./models/User");
const Message = require("./models/Message");
const Channel = require("./models/Channel");

const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cors = require("cors");
app.use(cors());
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.send("Welcome Slack-like");
});

app.post("/log_in", function(req, res) {
  console.log("body of login :  ", req.body);
  const user = new User(req.body.user);
  if (!user || !user.name) {
    console.log("No user recieved");
    return res.status(207).json({ error: "No user recieved" });
  }
  user.save(function(error) {
    if (error) {
      var messages = Object.keys(error.errors).map(element => {
        return error.errors[element].message;
      });
      console.log(messages);
      return res.status(400).send(messages);
    }
    console.log("User recieved : ", user);
    return res.json({ message: "User recieved !", user: user });
  });
});

app.get("/messages", function(req, res) {
  console.log("getting messages");

  Message.find({})
    .populate("user")
    .exec(function(err, messages) {
      res.json({ messages });
    });
});
app.get("/channels", function(req, res) {
  console.log("getting channels");
  Channel.find({})
    .populate("user", "channel")
    .exec(function(err, channels) {
      res.json({ channels });
    });
});

io.on("connection", client => {
  client.join("general");
  client.join("channel2");
  client.on("newMessage", message => {
    console.log("New message arrived :", message);
    const mes = new Message(message);
    console.log("mes : ", mes);
    mes.save(function(error) {
      console.log("error in save ? :", error);
      // if (error) return res.satuts(400).send(error);
      io.emit("newMessageDisplay", message);
    });
  });
  client.on("newChannel", channel => {
    console.log("New channel created : ", channel);
    const chan = new Channel(channel);
    console.log("mes : ", chan);
    chan.save(function(error) {
      console.log("error in save ? :", error);
      // if (error) return res.satuts(400).send(error);
      io.emit("newChannelDisplay", channel);
    });
  });
});

server.listen(process.env.PORT || 3001, function() {
  console.log("listening on port :", process.env.PORT || 3001);
});
