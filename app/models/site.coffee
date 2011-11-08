mongoose = require 'mongoose'
Schema = mongoose.Schema

SiteSchema = new Schema
  domain: String
  keywords: [String]

exports.Site = mongoose.model 'Sites', SiteSchema
