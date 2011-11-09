mongoose = require 'mongoose'
Schema = mongoose.Schema

Site = (require 'site').Site

ReportSchema = new Schema
  domain: String
  timestamp: Date
  isp: String
  countryName: String
  countryCode: String

ReportSchema.pre 'save', (next) ->
  Site.findOne domain: @.domain, (err, site) =>
    if not site?
      next()
      return

    site.reports ||= 0
    site.reports += 1
    site.save ->
      next()

exports.Report = mongoose.model 'Reports', ReportSchema
