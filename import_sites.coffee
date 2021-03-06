#! /usr/bin/env coffee

mongoose = require 'mongoose'
db = 'mongodb://localhost/sharpnodes'
mongoose.connect db

require.paths.unshift("app/models")
require.paths.unshift("lib")

Site = require('site').Site

jsonImport = require("json_line_importer")

Site.remove ->
  doFunc = (obj, cb) -> 
    (new Site(obj)).save(cb)
  jsonImport(doFunc, process.stdin, process.exit)

