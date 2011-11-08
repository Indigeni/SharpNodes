
Site = require("site").Site

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

