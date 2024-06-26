//Packages
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var uuid = require('uuid');
//--------------------------------------

//Routes
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var pollsRouter = require('./routes/polls');
var feedRouter = require('./routes/feed');
var tagsRouter = require('./routes/tags');
//--------------------------------------

var app = express();

//Middleware
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.REQUEST_ORIGIN_URL);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, DELETE, POST, HEAD, OPTIONS');
  next();
});

//---------------------------------------------------------------------------

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: 'poll_cookie',
    resave: false,
    saveUninitialized: true,
    httpOnly: false,
    genid: (req) => uuid.v4(),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, //One day
  }),
);
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/polls', pollsRouter);
app.use('/feed', feedRouter);
app.use('/tags', tagsRouter);
//---------------------------------------

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send error code
  res.status(err.status || 500);
});

module.exports = app;
