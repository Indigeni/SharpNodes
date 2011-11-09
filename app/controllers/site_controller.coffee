
Site = require("site").Site

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
