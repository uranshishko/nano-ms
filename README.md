# NanoMS
NanoMS is a http framework for creating microservices.
(This project is currently in **very early alpha stages** and will most likely be reworked a few times)

## Get Started
### Requirements
###### NodeJS V10 or higher

Here are six quick steps to get started

1. Create e new directory and initialize npm
```bash
> mkdir my-folder && npm init -y
```
2. Move to your new directory and install NanoMS using npm:
```bash
> cd my-folder && npm install nanoms
```
3. Create a _server.js_ file and import NanoMS
```bash
> touch server.js
```
```javascript
const NanoMS = require('nanoms')
```
4. Create a new instance of NanoMS in _server.js_ and pass a port number as an argument
```javascript
const nms = new NanoMS(3000) // 'localhost:XXXX' or '127.0.0.1:XXXX' etc can also be used if host needs to be specified
```
5. Specify a body-parsing middleware to be used with the `use()` method
```javascript
/*
  * NanoMS includes two built in middleware functions for parsing 
  the request body to url-encoded or JSON format
  
  * You can define and add your own global middleware functions with the use() method
*/

nms.use(nms.json) // or nms.urlEncoded
```

6. Lastly, start defining your service endpoints with the `createService()` method
```javascript
/*
  * createService() takes an object as an argument and 
  must include **two required properties (path and method, both of type 'string') 
  and one method (func that takes two parameters req and res)** and one optional property
  (middleware of type object) for defining service specific middleware functions.
*/

nms.createService({
  path: '/', // url path
  method: 'GET', // url method
  middleware: {
    // optional: middleware functions. can be either synchronous or asynchronous
  }
  async func(req, res) { // can be either synchronous or asynchronous
    res.send('Hello NanoMS')
  }
})
```

## Details
All NanoMS service and middleware functions receive **req** and **res** as arguments. 
`req` and `res` are direct references to `http.IncomingMessage` and `http.ServerResponse`. We recommend refering to the official NodeJS documentations (https://nodejs.org/dist/latest-v12.x/docs/api/).

NanoMS does however offer a few shorthand properties and methods
```javascript
req.body // holds the request body
req.params() // returns an object of all url queries
req.status(/* status-code */) // used to specify the status-code to be returned. refaults to 200. returns req.
req.send(/* data to be sent */) // used to send back data with the response.
                                // data types accepted: string, number, object, Buffer...
```
