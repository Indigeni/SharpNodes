util = require 'util'
mongoose = require 'mongoose'
Schema = mongoose.Schema

require 'node'
Node = mongoose.model 'Nodes'

controller = {}

controller.index =
  json: (req, res) ->
    Node.find {}, (err,docs) ->
      res.send JSON.stringify docs
  html: (req, res) ->
    res.send('html')

controller.show =
  json:(req,res) ->
    res.send 'node#show: ' + util.inspect req.node
  html:(req,res) ->
    res.send  JSON.stringify util.inspect req.node

controller.new = (req,res) ->
  node1 = new Node
    name: 'first'
    url:  'www.google.com'
  node1.save (err) ->
    res.send('new node')
    
controller.load = (id,callback) ->
  callback null
    id: id
    name: 'Node: #' + id

module.exports = (app) ->
  app.resource 'nodes', controller
