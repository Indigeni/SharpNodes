var fs = require("fs"),
    url = require("url"),
    path = require("path"),
    async = require("async"),
    http = require("http"),
    request = require("request"),
    Handlebars = require("handlebars"),
    _ = require("underscore")

require("coffee-script")

jake = require("./lib/jake-spawner")(jake)

var ROOT_DIRECTORY = path.normalize(__dirname)
var WORK_DIRECTORY = path.join(ROOT_DIRECTORY, ".work")
var RUN_DIRECTORY = path.join(WORK_DIRECTORY, "pid")
var DB_DIRECTORY = path.join(WORK_DIRECTORY, "data")
var LOG_DIRECTORY = path.join(WORK_DIRECTORY, "log")

var SHARPNODES = {
  root: ROOT_DIRECTORY,
  pid: path.join(RUN_DIRECTORY, "sharpnodes.pid"),
  log: path.join(LOG_DIRECTORY, "sharpnodes.log"),
  host: "127.0.0.1",
  port: 3000
}

var MONGO = {
  root: DB_DIRECTORY,
  pid: path.join(RUN_DIRECTORY, "mongo.pid"),
  log: path.join(LOG_DIRECTORY, "mongo.log"),
  host: "127.0.0.1",
  port: 27017
}

desc("Start the app on port 3000")
task({"start": []}, function() {
  var app = require('./app.coffee');
  app.start({ "port": 3000 });
})

desc("Start the app for the tests")
task({"tests-start": []}, function() {
  var app = require('./app.coffee');
  app.start({ "port": 3000, "db": y });
})

desc("Run all specs")
task({"spec": ["start"]}, function() {
  var path = require("path"),
      jasmine = require("./spec/lib/jasmine-node"),
      specFolderPath = path.join(ROOT_DIRECTORY, "spec", "src"),
      showColors = true,
      isVerbose = true,
      filter = /\.(js|coffee)$/

  SHARPNODES.url = "http://" + SHARPNODES.host + ":" + SHARPNODES.port
  jasmine.SHARPNODES = SHARPNODES
  jasmine.MONGO = MONGO

  if (arguments.length > 0) {
    filter = new RegExp(
      _(Array.prototype.slice.call(arguments, 0)).map(function(suite) {
        return suite + "\\.js$"
      }).join("|")
    )
  }

  jasmine = require("./spec/lib/jasmine-request")(jasmine)
  jasmine.request.target(SHARPNODES.url)

  for (var key in jasmine) global[key] = jasmine[key]
  jasmine.executeSpecsInFolder(specFolderPath, function(runner, log) {
    process.exit(runner.results().failedCount)
  }, isVerbose, showColors, filter)
})
