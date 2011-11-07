describe("url requests", function() {
  it("get /", function() {
    wait()
    get("/", function(error, response, body) {
      expect(response.statusCode).toBe(200)
      done()
    })
  })
  
  it("nodes json list", function() {
    wait()
    get("/nodes.json", function(error, response, body) {
      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toBe('application/json')
      done()
    })
  })
  
  it("create new node", function() {
    wait()
    get("/nodes/new", function(error, response, body) {
      expect(response.statusCode).toBe(200)
      expect(body).toEqual("new node")
      done()
    })
  })
  
})