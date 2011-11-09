mongoose = require 'mongoose'
Schema = mongoose.Schema

Country = (require 'country').Country

CountrySchema = new Schema
  name: 
    type: String
    unique: true
  code: String
  flag: String
  reports: Number
  scores:
    social: Number
    political : Number
    tools: Number
    security: Number
  url: String
  consistency: Number
  trasparency: Number

exports.Country = mongoose.model 'Countries', CountrySchema
