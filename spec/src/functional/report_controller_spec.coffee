async = require 'async'
Report = require("report").Report
Country = require("country").Country

insertData = ->
  async.parallel [
    (next) ->
      country = new Country
        name: 'italy'
        flag: 'it-flag.png'
      country.save -> next()
    ,(next) ->
      country = new Country
        name: 'england'
        flag: 'en-flag.png'
      country.save -> next()
    ,(next) ->
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
        isp: 'h_telecom'
        countryName: 'england'
        countryCode: 'uk'
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
      countries = JSON.parse(response.body).countries
      expect(countries[0].name).toEqual("england")
      expect(countries[0].flag).toEqual("en-flag.png")
      expect(countries[1].name).toEqual("italy")
      expect(countries[1].flag).toEqual("it-flag.png")
      done()

  it "GET /SITE/domain/country/countryname", ->
    insertData()
    wait()
    get '/site/www.google.it/country/england/isps', (error, response, body) ->
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toBe('application/json')
      expect(response.body).toBe('{"isps":["h_telecom","h_telecom_2"],"herdict_report_count":3}')
      done()
      
  it "get GET SITE/WRONG/COUNTRIES", ->
    insertData()
    wait()
    get "/site/www.pippo.it/countries", (error, response, body) ->
      expect(response.statusCode).toBe(404)
      expect(response.headers["content-type"]).toBe('application/json')
      expect(response.body).toBe('{"error":"not found"}')
      done()
