const express        = require("express");
const authController = express.Router();
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
// User model
const User         = require("../models/user");
// Bcrypt to encrypt passwords
const bcrypt         = require("bcrypt");
const bcryptSalt     = 10;

authController.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

authController.post("/signup", (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Please indicate a username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "Sorry, this username already exists.  Please pick another." });
      return;
    }

    var salt     = bcrypt.genSaltSync(bcryptSalt);
    var hashPass = bcrypt.hashSync(password, salt);

    var newUser = new User({
      username: req.body.username,
      password: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth/signup", { message: "The username already exists" });
      } else {
        res.redirect("/login");
      }
    });
  });
});



authController.get("/login", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error")});
});

authController.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

// authController.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
//   res.render("private", { user: req.user });
// });

authController.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});


authController.get("/auth/facebook", passport.authenticate("facebook"));


authController.get("/auth/facebook/callback", passport.authenticate("facebook", {
  //successRedirect: "/private-page",
  successRedirect: "/",
  failureRedirect: "/"
}));

authController.get("/auth/google", passport.authenticate("google", {
  scope: ["https://www.googleapis.com/auth/plus.login",
          "https://www.googleapis.com/auth/plus.profile.emails.read"]
}));

authController.get("/auth/google/callback", passport.authenticate("google", {
  //successRedirect: "/private-page",
  successRedirect: "/",
  failureRedirect: "/"
}));


// authController.get('/private', ensureAuthenticated, (req, res) => {
//   res.render('private', {user: req.user});
// });
// old version - checks only if user is logged in, does not check role
const checkGuest  = checkRoles('GUEST'); // from lesson, THESE NEED TO BE HERE, IT WILL BREAK IF THEY ARE DEFINED BELOW THE ROUTE WHERE THEY ARE USED
const checkEditor = checkRoles('EDITOR');
const checkAdmin  = checkRoles('ADMIN');

authController.get('/private', checkAdmin, (req, res) => {
  res.render('private', {user: req.user});
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login')
  }
}


function checkRoles(role) {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      res.redirect('/login')
    }
  }
}







module.exports = authController;
