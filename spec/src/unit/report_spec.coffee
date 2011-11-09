Report = require("report").Report

describe 'Report', ->

  beforeEach ->
    wait()
    Report.remove {}, ->
      done()

  it 'should save and load a Report', ->
    report = new Report
      domain:      'google.it'
      timestamp:   new Date
      isp:         'fastweb'
      countryName: 'it'
      countryCode: 'italy'
    
    report.save (err) ->
      Report.find domain: 'google.it', (err, docs) ->
        expect(docs[0].domain).toBe(report.domain)
        done()
      
    wait()
    
  