var mongoose = require('mongoose')
var express = require('express')
var path = require('path')
// var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var cors = require('cors')

var routes = require('./routes/index')
var users = require('./routes/users')
var login = require('./routes/login')
var highlights = require('./routes/highlights')

var app = express()

// enable cors
app.use(cors())

// connect to database
var dbUrl = process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : 'mongodb://localhost:27017/anotode'
mongoose.Promise = global.Promise
mongoose.connect(dbUrl)
  .then(() => console.log('Connection successful'))
  .catch((err) => console.log(err))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// set API routes
app.use('/', routes)
app.use('/api/users', users)
app.use('/api/login', login)
app.use('/api/highlights', highlights)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app
