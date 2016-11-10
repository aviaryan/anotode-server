var express = require('express')
var router = express.Router()

var auth = require('./lib/auth.js')
var error = require('./lib/helpers.js').makeError

var Highlight = require('../models/Highlight.js')

/*
 * GET user's highlights
 */
router.get('/', function (req, res, next) {
  auth.verifyJWT(req.query.token).then((id) => {
    // make filter
    var filter = {user_id: id}
    if (req.query.url_eq) {
      filter['url'] = req.query.url_eq
    }
    if (req.query.text_contains) {
      filter['text'] = new RegExp(req.query.text_contains, 'i')
    }
    if (req.query.url_contains) {
      filter['url'] = new RegExp(req.query.url_contains, 'i')
    }
    if (req.query.contains) {
      // http://stackoverflow.com/questions/7382207/mongooses-find-method-with-or
      filter['$or'] = []
      var arr = ['text', 'title', 'comment', 'category', 'url', 'tags']
      // will work for tags array as tags is array of strings
      // http://stackoverflow.com/questions/18148166/
      for (var i = 0; i < arr.length; i++) {
        var obj = {}
        obj[arr[i]] = new RegExp(req.query.contains, 'i')
        filter['$or'].push(obj)
      }
    }
    console.log(filter)
    // find
    Highlight.find(filter, (err, hls) => {
      if (err) {
        return error(res, err)
      }
      res.json(hls)
    })
  }, (err) => {
    error(res, err)
  })
})

/*
 * Create new highlight
 */
router.post('/', function (req, res, next) {
  auth.verifyJWT(req.query.token).then((id) => {
    var highlight = new Highlight(req.body)
    highlight.user_id = id
    highlight.save((err) => {
      if (err) {
        return error(res, err)
      }
      res.json(highlight)
    })
  }, (err) => {
    error(res, err)
  })
})

/*
 * Delete a highlight
 */
router.delete('/:hid', function (req, res, next) {
  auth.verifyJWT(req.query.token).then((id) => {
    var filterJson = { user_id: id, _id: req.params.hid }
    Highlight.findOneAndRemove(filterJson, (err) => {
      if (err) {
        return error(res, err)
      }
      res.send('Success')
    })
  }, (err) => {
    error(res, err)
  })
})

/*
 * Update a highlight
 */
router.put('/:hid', function (req, res, next) {
  auth.verifyJWT(req.query.token).then((id) => {
    var filterJson = { user_id: id, _id: req.params.hid }
    Highlight.findOneAndUpdate(filterJson, req.body, (err, post) => {
      if (err) {
        return error(res, err)
      }
      Highlight.findById(req.params.hid, (err, hl) => {
        if (err) {
          return error(res, err)
        }
        res.json(hl)
      })
    })
  }, (err) => {
    error(res, err)
  })
})

// Export the Router
module.exports = router
