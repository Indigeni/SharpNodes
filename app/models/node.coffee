mongoose = require 'mongoose'
Schema = mongoose.Schema

NodeSchema = new Schema
  name: String
  url : String

exports.Node = mongoose.model 'Nodes', NodeSchema;