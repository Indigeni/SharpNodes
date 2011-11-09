Site = require("site").Site

describe 'Site', ->

  beforeEach ->
    wait()
    Site.remove {}, ->
      done()

  it 'should save and load a Site', ->
    site = new Site
      domain: "google.it"
      keywords: ["search", "tools"]
    site.save (err) ->
      Site.find domain: "google.it", (err, docs) ->
        expect(docs[0].domain).toBe(site.domain)
        for keyword in site.keywords
          expect(docs[0].keywords).toContain(keyword)
        done()
    wait()

  it 'should not save a duplicated domain', ->

    site = new Site
      domain: "google.it"
      keywords: ["aaa", "bbb"]

    site.save (e1) ->

      notValidSite = new Site
        domain: "google.it"

      notValidSite.save (e2) ->
        expect(e2).toNotBe(null)
        done()

    wait()

  it 'should find only one domain', ->
    site = new Site
      domain: "google.it"
      keywords: ["aaa", "bbb"]
    site.save (err) ->

      notValidSite = new Site
        domain: "google.it"
      notValidSite.save (err) ->

        Site.find domain: "google.it", (err, docs) ->
          expect(docs.length).toBe(1)
          done()
    wait()

