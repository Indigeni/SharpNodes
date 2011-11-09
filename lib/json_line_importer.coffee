
Lazy = require 'lazy'

module.exports = (doFunc, stream, callback) ->

  read_count = 0
  write_count = 0

  new Lazy(stream)
    .lines
      .forEach (line) ->
        line = line.toString()
        if line != '0'
          read_count += 1
          obj = JSON.parse(line)
          doFunc obj, ->
            write_count += 1
            callback() if write_count == read_count

  stream.resume()

