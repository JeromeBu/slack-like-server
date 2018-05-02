const express = require("express")
const app = express()
const morgan = require("morgan")
app.use(morgan("dev"))
var mongoose = require("mongoose")
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/slack-like"
)
const User = require("./models/User")
const Message = require("./models/Message")
const Channel = require("./models/Channel")

const server = require("http").createServer(app)
const io = require("socket.io")(server)
const cors = require("cors")
app.use(cors())
const bodyParser = require("body-parser")
app.use(bodyParser.json())

app.get("/", function(req, res) {
  res.send("Welcome Slack-like")
})

app.post("/log_in", function(req, res) {
  console.log("body of login :  ", req.body)
  const user = new User(req.body.user)
  if (!user || !user.name) {
    console.log("No user recieved")
    return res.status(207).json({ error: "No user recieved" })
  }
  user.save(function(error) {
    if (error) {
      var messages = Object.keys(error.errors).map(element => {
        return error.errors[element].message
      })
      console.log(messages)
      return res.status(400).send(messages)
    }
    console.log("User recieved : ", user)
    return res.json({ message: "User recieved !", user: user })
  })
})

app.get("/messages", function(req, res) {
  console.log("getting messages")
  console.log("req.query : ", req.query)
  const channel = req.query.channel
  // if (!channel) return res.status(207).json({ error: "no channel given" });
  console.log("Channel looked for is : ", channel)
  Channel.findOne({ name: channel })
    .populate({ path: "messages", populate: { path: "user" } })
    .exec(function(err, channel) {
      console.log("channel :", channel)
      console.log("channel.messages : ", channel.messages)
      res.json({ messages: channel.messages })
    })
})
app.get("/channels", function(req, res) {
  console.log("getting channels")
  Channel.find({})
    .populate("user", "channel")
    .exec(function(err, channels) {
      res.json({ channels })
    })
})

io.on("connection", client => {
  client.on("newMessage", message => {
    console.log("New message arrived :", message)
    const mes = new Message(message)
    console.log("mes : ", mes)
    console.log("socket rooms : ", client.rooms)
    mes.save(function(errorSaveMessage) {
      if (errorSaveMessage)
        console.log("error when saving message :", errorSaveMessage)
      Channel.findById(mes.channel).exec(function(errorFindChannel, channel) {
        if (errorFindChannel)
          console.log("error when finding channel :", errorFindChannel)
        console.log("The channel of the message is : ", channel.name)
        channel.messages.push(mes)
        channel.save(function(errorChannelWithNewMessage) {
          if (errorChannelWithNewMessage)
            console.log(
              "error when saving channel with new  message :",
              errorChannelWithNewMessage
            )
          console.log("message send in channel : ", channel.name)
          io.to(channel.name).emit("newMessageDisplay", message)
        })
      })
      // if (error) return res.satuts(400).send(error);
    })
  })
  client.on("newChannel", channel => {
    console.log("New channel created : ", channel)
    const chan = new Channel(channel)
    console.log("mes : ", chan)
    chan.save(function(error) {
      console.log("error in save ? :", error)
      // if (error) return res.satuts(400).send(error);
      io.emit("newChannelDisplay", chan)
    })
  })
  client.on("room", function(channelName) {
    console.log("someone joined channel : ", channelName)
    client.join(channelName)
  })
  client.on("isWritting", function(user) {
    console.log(`${user.name} is writing a message in ${client.room}`)
    io.sockets
      // .in(client.room)
      .emit("showWriting", `${user.name} is writing a message`)
  })
})

server.listen(process.env.PORT || 3001, function() {
  console.log("listening on port :", process.env.PORT || 3001)
})
