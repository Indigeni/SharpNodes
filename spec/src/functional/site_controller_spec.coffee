async = require 'async'
Site = require("site").Site

insertData = ->
  async.parallel [
    (next) ->
      site = new Site
        domain: "google.it"
        keywords: ["search", "tools"]
        reports: 68
      site.save -> next()
    ,(next) ->
      site = new Site
        domain: "pippo.it"
        keywords: ["search", "tools"]
        reports: 68
      site.save -> next()
    ],
    (error) ->
      fail(error) if (error)
      complete()

describe "site controller", ->

  beforeEach ->
    wait()
    Site.remove {}, ->
      done()

  it "get site not found", ->
    wait()
    get "/site/non-existent", (error, response, body) ->
      expect(response.statusCode).toBe(404)
      expect(response.headers["content-type"]).toBe('application/json')
      done()
  
  it "get site", ->
    site = new Site
      domain: "google.it"
      keywords: ["aaa", "bbb"]

    site.save (err) ->

      get "/site/google.it", (error, response, body) ->
        expect(response.statusCode).toBe(200)
        expect(response.headers["content-type"]).toBe('application/json')

        expect(body).toEqual(JSON.stringify(site))
        done()

    wait()
    
  it "get top sites", ->
    insertData()
    wait()
    get '/top_sites', (error, response, body) ->
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toBe('application/json')
      expect(JSON.parse(body).sites.length).toEqual(2)
      done()
      
