
Report = require("report").Report
_ = require 'underscore'

module.exports = (app) ->
  app.get '/site/:domain/countries', (req, res) ->
    res.contentType('application/json')

    Report.find domain: req.params.domain, (err, docs) ->
      if docs.length != 0
        docs = _(docs).map (el) ->
          el.countryName
        res.send JSON.stringify('countries': docs)
      else
        res.send JSON.stringify(error: "not found"), 404