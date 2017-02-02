const express        = require("express");
const authController = express.Router();
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
// User model
const User         = require("../models/user");



Roomsrouter.get('/rooms', ensureAuthenticated, (req, res, next) => {

  Room.find({owner: req.user._id}, (err, myRooms) => {
    if (err) { return next(err); }

    res.render('rooms/index', { rooms: myRooms });
  });
});

roomsRouter.post('/rooms', ensureAuthenticated, (req, res, next) => {
  const newRoom = new Room ({
    name:  req.body.name,
    desc:  req.body.desc,
    owner: req.user._id   // <-- we add the user ID
  });

  newRoom.save ((err) => {
    if (err) { return next(err); }
    else {
      res.redirect('/rooms');
    }
  })
});






module.exports = roomsRouter;
