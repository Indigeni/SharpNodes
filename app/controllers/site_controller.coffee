
Site = require("site").Site

sys = require('sys')
child_process = require('child_process')
process = global.process
path = require('path')
fs = require('fs')

runExternal = (command, args=[], callback) ->
  console.log("Running #{command} #{args.join(" ")}")
  child = child_process.spawn(command, args,
    customFds: [process.stdin, process.stdout, process.stderr])
  child.on('exit', callback) if callback?

fetchImage = (width, length, req, res, buildParams) ->
  res.contentType('image/png')
  Site.find domain: req.params.domain, (err, docs) ->
    if docs[0]?
      [url, file] = buildParams(req.params.domain)
      fs.lstat file, (err, stat) ->
        if stat.isFile()
          res.sendfile(file)
        else
          runExternal "phantomjs", [__dirname + "/../../rasterize.js", width, length, url, file], ->
            res.sendfile(file)
    else
      res.send JSON.stringify(error: "not found"), 404

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
    fetchImage(1024, 768, req, res, ( (domain) -> ["http://www.#{domain}", "/tmp/#{domain}.png"]))

  app.get '/site/:domain/icon', (req, res) ->
    fetchImage(16, 16, req, res, ( (domain) -> ["http://www.#{domain}/favicon.ico", "/tmp/#{domain}-ico.png"]))
