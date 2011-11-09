async = require 'async'
Report = require("report").Report


insertData = ->
  async.parallel [
    (next) ->
      report = new Report
        domain: 'www.google.it'
        timestamp: new Date()
        isp: 'fastweb'
        countryName: 'italy'
        countryCode: 'it'
      report.save -> next()
    ,(next) ->
      report = new Report
        domain: 'www.google.it'
        timestamp: new Date()
        isp: 'ftelecom'
        countryName: 'france'
        countryCode: 'fr'
      report.save -> next()
    ,(next) ->
      report = new Report
        domain: 'www.google.it'
        timestamp: new Date()
        isp: 'h_telecom'
        countryName: 'england'
        countryCode: 'en'
      report.save -> next()
    ,(next) ->
      report = new Report
        domain: 'www.google.it'
        timestamp: new Date()
        isp: 'h_telecom_2'
        countryName: 'england'
        countryCode: 'en'
      report.save -> next()
    ],
    (error) ->
      fail(error) if (error)
      complete()


describe "report controller", ->

  beforeEach ->
    wait()
    Report.remove {}, ->
      done()

  it "get GET SITE/[DOMAIN]/COUNTRIES", ->
    insertData()
    wait()
    get "/site/www.google.it/countries", (error, response, body) ->
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toBe('application/json')
      expect(response.body).toBe('{"countries":["italy","france","england"]}')
      done()
      
  it "get GET SITE/WRONG/COUNTRIES", ->
    insertData()
    wait()
    get "/site/www.pippo.it/countries", (error, response, body) ->
      expect(response.statusCode).toBe(404)
      expect(response.headers["content-type"]).toBe('application/json')
      expect(response.body).toBe('{"error":"not found"}')
      done()