mongoose = require 'mongoose'
Schema = mongoose.Schema

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
  consistency: String
  trasparency: String
  google:
    userData:
      usersDataRequests: Number
      usersAccountsSpecified: Number
      usersDataRequestsPercFulfilled: Number
    contentRemoval:
      contentRemovalPercFulfilled: Number
      contentRemovalPercFulfilled: Number
      itemsRequestedForRemoval: Number

exports.Country = mongoose.model 'Countries', CountrySchema
