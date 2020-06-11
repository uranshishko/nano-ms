# NanoMS

NanoMS is a http framework for creating microservices.
(This project is currently in **very early alpha stages** and will most likely be reworked a few times)

## New in v1.1.0

Added file serving functionality. Refer to API documentation below. The rest of the API should not be affected.
This new API relies on [_mime-types_](https://www.npmjs.com/package/mime-types) as a dependency for content type detection.

Here's an example on how to use the new file serving API: [![Edit restless-meadow-ib9pl](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/restless-meadow-ib9pl?autoresize=1&fontsize=14&hidenavigation=1&theme=dark)

## Get Started

### Requirements

###### NodeJS V10 or higher

Here are six quick steps to get started

1. Create e new directory. Move to your new directory and and initialize npm

```bash
> mkdir my-folder && cd my-folder && npm init -y
```

2. Install NanoMS using npm

```bash
> npm install nanoms
```

3. Create a _server.js_ file and import NanoMS

```bash
> touch server.js
```

```javascript
const { NanoMS } = require('nanoms');
```

4. Create a new instance of NanoMS in _server.js_ and pass a port number as an argument

```javascript
const nms = new NanoMS(3000); // 'localhost:XXXX' or '127.0.0.1:XXXX' etc can also be used if host needs to be specified
```

5. Specify a body-parsing middleware to be used with the `use()` method

```javascript
/*
  * NanoMS includes two built in middleware functions for parsing 
  the request body to url-encoded or JSON format
  
  * You can define and add more built-in, or your own global middleware functions with the use() method
*/

nms.use(nms.json); // or nms.urlEncoded
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

NanoMS does however offer a few built-in methods, as well as shorthand properties and methods

## API

```javascript
NanoMS.createService(/* { configuration } */); // method for creating services. (see example above)
NanoMS.json(/* req, res */); // built-in body-parsing middleware function (Buffer to JSON)
NanoMS.urlEncoded(/* req, res */); // built-in body-parsing middleware function (Buffer to url-encoded)
NanoMS.setStatic(/* path */); // specify path for serving static files
NanoMS.static(/* req, res */); // built-in middleware for serving static files from previously set path (see NanoMS.setStatic)
NanoMS.use(/* middleware function */); // built-in method for specifying global middleware functions. passes on req and res as arguments

req.app; // holds an instance of NanoMS
req.body; // holds the request body. retuns a Buffer if no parsing middleware is used
req.cookies; // holds an object with key value pairs
req.getHeader(/* header */); // returns header or undefined if non-existent
req.query(/* query */); // returns url query. returns undefined in non-existent. returns an object of all url queries by default.
res.status(/* status-code */); // used to specify the status-code to be returned. returns res.
res.send(/* data to be sent */); // used to send back data with the response.
// data types accepted: string, number, object, Buffer...
res.sendFile(/* fileName or path within static folder. ilename extention can be omitted if the file is a HTML file */); // used inside of service functions for redirecting and serving static files
res.redirect(/* url, (optional: status-code) */);
```
