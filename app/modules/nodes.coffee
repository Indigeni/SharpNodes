util = require 'util'
mongoose = require 'mongoose'
Schema = mongoose.Schema

db = mongoose.connect 'mongodb://localhost/sharpnodes';

require './../models/node'
Node = db.model 'Nodes'

exports.index =
  json: (req, res) ->
    Node.find {}, (err,docs) ->
      res.send JSON.stringify docs
  html: (req, res) ->
    res.send('html')

exports.show = 
  json:(req,res) ->
    res.send 'node#show: ' + util.inspect req.node
  html:(req,res) ->
    res.send  JSON.stringify util.inspect req.node

exports.new = (req,res) ->
  node1 = new Node
    name: 'first'
    url:  'www.google.com'
  node1.save (err) ->
    res.send('new node')
    
exports.load = (id,callback) ->
  callback null
    id: id
    name: 'Node: #' + id