module.exports = (app) ->
  app.get '/', (req, res) ->
    res.render('index.eco',
      layout: false
    )
  
  app.resource 'node', require '../modules/nodes'
  
  

