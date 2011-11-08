mongoose = require 'mongoose'
Schema = mongoose.Schema

SiteSchema = new Schema
  domain: 
    type: String
    unique: true
    require: true
  keywords: [String]

exports.Site = mongoose.model 'Sites', SiteSchema
