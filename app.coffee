#! /usr/bin/env coffee

# Module dependencies.

resource = require 'express-resource'
optimist = require 'optimist'
express = require 'express'
path = require 'path'
eco = require 'eco'
fs = require 'fs'

# Create Server

app = express.createServer()

# Configuration

app.configure -> 
  app.register ".eco", eco
  app.set('views', __dirname + '/app/views')
  app.set('view engine', 'eco')
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(express.static(__dirname + '/public'))

app.configure 'development', ->
  eco.cache = false
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))

app.configure 'production', ->
  app.use(express.errorHandler())

require.paths.unshift("app/controllers")
require.paths.unshift("app/models")

require('home_controller')(app)
require('nodes_controller')(app)

# Helpers

helpersPath = __dirname + "/app/helpers/"
for helper in fs.readdirSync(helpersPath)
  app.helpers require(helpersPath + helper) if helper.match /(js|coffee)$/

# Start the module if it's needed

optionParser = optimist.default('port', 3000).
  usage("Usage: $0 [-p PORT]").
  alias('port', 'p').
  describe('port', 'The port the server will listen to').
  boolean("help").
  describe("help", "This help")

argv = optionParser.argv

start = module.exports.start = (port = argv.port) ->
  if argv.help
    optionParser.showHelp()
    return 1

  app.listen(port)
  console.log("SharpNodes server listening on port %d in %s mode", app.address().port, app.settings.env)


if path.resolve(argv["$0"].split(' ')[1]) == path.resolve(__filename)
  start()


