
Country = require("country").Country

module.exports = (app) ->
  app.get '/country/:name', (req, res) ->
    res.contentType('application/json')

    Country.find name: req.params.name, (err, docs) ->
      if docs[0]?
        res.send JSON.stringify docs[0]
      else
        res.send JSON.stringify(error: "not found"), 404