#! /usr/bin/env coffee

mongoose = require 'mongoose'
db = 'mongodb://localhost/sharpnodes'
mongoose.connect db

require.paths.unshift("app/models")
require.paths.unshift("lib")
Report = require('report').Report

jsonImport = require("json_line_importer")

Report.remove ->
  doFunc = (obj, cb) -> 
    obj.timestamp = new Date(obj.timestamp)
    (new Report(obj)).save(cb)
  jsonImport(doFunc, process.stdin, process.exit)
