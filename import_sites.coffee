#! /usr/bin/env coffee

mongoose = require 'mongoose'
db = 'mongodb://localhost/sharpnodes'
mongoose.connect db

require.paths.unshift("app/models")
require.paths.unshift("lib")

jsonImport = require("json_line_importer")
jsonImport require('site').Site, process.stdin, ->
  process.exit()

