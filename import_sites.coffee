#! /usr/bin/env coffee

mongoose = require 'mongoose'
db = 'mongodb://localhost/sharpnodes'
mongoose.connect db

require.paths.unshift("app/models")

Site = require('site').Site

Lazy = require 'lazy'

read_count = 0
write_count = 0
closing = false

Site.remove ->
  new Lazy(process.stdin)
      .lines
      .forEach (line) ->
        line = line.toString()
        if line != '0'
          read_count += 1
          obj = JSON.parse(line)
          (new Site(obj)).save (err) ->
            console.log(err) if err?
            write_count += 1
            process.exit() if write_count == read_count
        else
          closing = true

  process.stdin.resume()
