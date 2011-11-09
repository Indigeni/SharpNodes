async = require 'async'
Country = require("country").Country


insertData = ->
  async.parallel [
    (next) ->
      report = new Country
        name: 'italy'
        flag: 'it.jpg'
        code: 'it'
        reports: 140
        scores:
          social: 9
          political : 8
          tools: 7
          security: 6
        url: 'www.italia.it'
        consistency: 0.5
        trasparency: 0.8
      report.save -> next()
    ],
    (error) ->
      fail(error) if (error)
      complete()


describe "country controller", ->

  beforeEach ->
    wait()
    Country.remove {}, ->
      done()

  it "GET Country/name OK", ->
    insertData()
    wait()
    get "/country/italy", (error, response, body) ->
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toBe('application/json')
      expect(JSON.parse(response.body).name).toBe('italy')
      expect(JSON.parse(response.body).scores.social).toBe(9)
      expect(JSON.parse(response.body).trasparency).toBe(0.8)
      done()
  
  it "GET Country/name KO", ->
    get "/country/italy_mmmm", (error, response, body) ->
      expect(response.statusCode).toBe(404)
      expect(response.headers["content-type"]).toBe('application/json')
      expect(response.body).toBe('{"error":"not found"}')
      done()
    
  
  
  
