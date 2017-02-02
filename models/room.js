const mongoose = require("mongoose");
const Schema   = mongoose.Schema;


const RoomSchema = Schema({
  name:  String,
  desc:  String,
  owner: UserSchema,
});







const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
