mongoose = require 'mongoose'

db = mongoose.connect 'mongodb://localhost/sharpnodes_test'

Site = require("site").Site

describe 'Site', ->

  it 'should save and load a Site', ->
    site = new Site
      domain: "google.it"
      keywords: ["search", "tools"]
    site.save()
    Site.find domain: "google.it", (err, docs) ->
      expect(docs[0].domain).toBe(site.domain)
      for keyword in site.keywords
        expect(docs[0].keywords).toContain(keyword)
      done()
    wait()

