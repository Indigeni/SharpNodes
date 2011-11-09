
Site = require("site").Site

sys = require('sys')
child_process = require('child_process')
process = global.process
path = require('path')

runExternal = (command, args=[], callback) ->
  console.log("Running #{command} #{args.join(" ")}")
  child = child_process.spawn(command, args,
    customFds: [process.stdin, process.stdout, process.stderr])
  child.on('exit', callback) if callback?

module.exports = (app) ->
  app.get '/site/:domain', (req, res) ->
    res.contentType('application/json')

    Site.find domain: req.params.domain, (err, docs) ->
      if docs[0]?
        res.send JSON.stringify docs[0]
      else
        res.send JSON.stringify(error: "not found"), 404

  app.get '/top_sites', (req, res) ->
    res.contentType('application/json')
    Site.findTopSites (err,docs) ->
        res.send JSON.stringify {sites: docs}

  app.get '/site/:domain/preview', (req, res) ->
    res.contentType('image/png')

    Site.find domain: req.params.domain, (err, docs) ->
      if docs[0]?
        domain = req.params.domain
        file = "/tmp/#{domain}.png"
        runExternal "phantomjs", [__dirname + "/../../rasterize.js", "1024", "768", "http://www.#{domain}", file], ->
          res.sendfile(file)
      else
        res.send JSON.stringify(error: "not found"), 404

  app.get '/site/:domain/icon', (req, res) ->
    res.contentType('image/png')

    Site.find domain: req.params.domain, (err, docs) ->
      if docs[0]?
        domain = req.params.domain
        file = "/tmp/#{domain}-icon.png"
        runExternal "phantomjs", [__dirname + "/../../rasterize.js", "16", "16", "http://www.#{domain}/favicon.ico", file], ->
          res.sendfile(file)
      else
        res.send JSON.stringify(error: "not found"), 404
