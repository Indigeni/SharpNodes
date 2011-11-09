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
  .gte(10)
  .desc('reports')
  .limit(20)
  .run(callback)

exports.Site = mongoose.model 'Sites', SiteSchema
