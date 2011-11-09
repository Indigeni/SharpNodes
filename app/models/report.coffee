mongoose = require 'mongoose'
Schema = mongoose.Schema

ReportSchema = new Schema
  domain: String
  timestamp: Date
  isp: String
  countryName: String
  countryCode: String
  
exports.Report = mongoose.model 'Reports', ReportSchema