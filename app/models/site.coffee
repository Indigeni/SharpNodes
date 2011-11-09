mongoose = require 'mongoose'
Schema = mongoose.Schema

SiteSchema = new Schema
  domain: 
    type: String
    unique: true
    require: true
  keywords: [String]
  reports: Number
  
SiteSchema.statics.findTopSites = (callback) ->
  this
  .where('reports')
  .gte(1)
  .desc('reports')
  .limit(100)
  .run(callback)

exports.Site = mongoose.model 'Sites', SiteSchema
