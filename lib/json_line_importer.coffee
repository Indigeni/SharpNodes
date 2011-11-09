
Lazy = require 'lazy'

module.exports = (klass, stream, callback) ->

  read_count = 0
  write_count = 0

  klass.remove ->
    new Lazy(stream)
        .lines
        .forEach (line) ->
          line = line.toString() if line?
          if line != '0'
            read_count += 1
            obj = JSON.parse(line)
            (new klass(obj)).save (err) ->
              write_count += 1
              callback() if write_count == read_count

    stream.resume()

