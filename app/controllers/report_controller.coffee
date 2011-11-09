
Report = require("report").Report
_ = require 'underscore'

module.exports = (app) ->
  app.get '/site/:domain/countries', (req, res) ->
    res.contentType('application/json')

    Report.distinct "countryName", {domain: req.params.domain}, (err, docs) ->
      if docs.length != 0
        res.send JSON.stringify('countries': docs)
      else
        res.send JSON.stringify(error: "not found"), 404
        
  app.get '/site/:domain/country/:country/isps', (req, res) ->
    res.contentType('application/json')
    
    Report.distinct "isp", { countryName: req.params.country, domain: req.params.domain}, (err, docs) ->
      if docs.length != 0
        res.send JSON.stringify('isps': docs)
      else
        res.send JSON.stringify(error: "not found"), 404