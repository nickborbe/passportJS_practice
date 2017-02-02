
const FbStrategy = require("passport-facebook").Strategy; // missing from lesson
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const mongoose = require('mongoose');
const User = require("./models/user");
const bcrypt         = require("bcrypt");
const bcryptSalt     = 10;
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
const flash = require("connect-flash");
ObjectId = require('mongodb').ObjectID;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var index = require('./routes/index');
var users = require('./routes/users');
const authController = require("./routes/authController");


const session       = require("express-session");
const MongoStore    = require("connect-mongo")(session);
const LocalStrategy = require("passport-local").Strategy;


var app = express();


mongoose.connect("mongodb://localhost/passport-local");


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash()); // not in the lesson


passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((id, cb) => {
  User.findOne({ "_id": id }, (err, user) => {
    if (err) { return cb(err); }
    cb(null, id);
  });
});


passport.use(new GoogleStrategy({
  clientID: "784641150730-buacj82i8oqknnc8d9bsecnvdtkue09u.apps.googleusercontent.com",
  clientSecret: "XUDtNaVNyorOkVsN1XtThWkN",
  callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({ googleID: profile.id }, (err, user) => {
    if (user === null){
      var newUser = new User({
        username: profile.emails[0].value,
        googleID: profile.id
      });
      newUser.save((err) => {
        if (err) { return done(err);}
        return done(null, newUser);
      });
    } else {
       done(null, user);
    }
  });
}));


passport.use(new FbStrategy({
  clientID: "1798433227085280",
  clientSecret: "d92dae3323a1b6b93028696e2176b56f",
  callbackURL: "http://localhost:3000/auth/facebook/callback"
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({ username: profile._json.name }, (err, user) => {
  if (err) { return done(err); }
  if (user === null){
    var newUser = new User({
      username: profile._json.name,
      facebookID: profile._json.id
    });
    newUser.save((err) => {
      if (err) {return done(err);}
      return done(null, newUser);
    });
  } else {
   done(null, user);
   }
  });
}));


passport.use(new LocalStrategy({
  passReqToCallback: true
  },(req, username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));



app.use(session({
  secret: "passport-local-strategy",
  resave: true,
  saveUninitialized: true,
  store: new MongoStore( { mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());
app.use(passport.session());


app.use('/', index);
app.use('/users', users);
app.use('/', authController);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
