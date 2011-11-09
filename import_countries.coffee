#! /usr/bin/env coffee

mongoose = require 'mongoose'
db = 'mongodb://localhost/sharpnodes'
mongoose.connect db

require.paths.unshift("app/models")
Country = require('country').Country

Country.remove ->

  fs = require('fs')
  fs.readFile process.argv[2], 'utf8', (err,data) ->
    if (err) 
      console.log(err)
    else
      json = JSON.parse(data)

    read_countries = 0
    write_countries = 0
    close = false
    for countryCode, country of json
      obj = new Country
        name: country.name
        code: countryCode
        flag: "/" + country.flag
        reports: country.reports
        scores:
          social: country.opennetData.social_score
          political: country.opennetData.political_score
          tools: country.opennetData.tools_score
          security: country.opennetData["conflict/security_score"]
        url: country.opennetData.url
        consistency: country.opennetData.consistency
        transparency: country.opennetData.transparency
        google: 
          userData: country.googleUsersDataRequests
          contentRemoval: country.googleContentRemovalRequests
          
      read_countries += 1
      obj.save (err, doc) -> 
        console.log(err) if err?
        write_countries += 1
        process.exit() if close and read_countries == write_countries

    close = true
