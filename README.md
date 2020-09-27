# NanoMS

## **v1.4.0 (Stable version)**

NanoMS is a minimalistic http library for creating microservices.

(We recommend always using the **latest version** in order to take advantage of the all the latest features. Some of the older versions may contain bugs and unstable features.)

## New in v1.2.0

1.  Added file serving functionality. Refer to API documentation below. The rest of the API should not be affected.
    This new API relies on [_mime-types_](https://www.npmjs.com/package/mime-types) as a dependency for content type detection.

    Here's an example on how to use the new file serving API: [![Edit restless-meadow-ib9pl](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/restless-meadow-ib9pl?autoresize=1&fontsize=14&hidenavigation=1&theme=dark)

2.  Added named route parameters. Accessed via params property on req (http.IncomingMessage).
    Example:

```javascript
nms.createService({
    path: '/users/:id',
    method: 'GET',
    func(req, res) {
        console.log(req.params.id);
        res.send();
    },
});

// GET /users/12345 => 12345
```

## New in v.1.3.0

1. Added a number of HttpExceptions. See full list below.
   Use one of the built in exceptions or, create a custom exception by using, or, by extending `HttpException` class:

```javascript
// Built-in exception example:
const { NotFoundException } = require('nanoms');

nms.createService({
  path: '/users/:id',
  method: 'GET',
  async func(req, res) {
    try {
      const user = await User.findById(req.params.id);
    } catch(e) {
      throw new NotFoundException('User could not be found!');
    }
  }
})

//---
// Sending a custom http exception
const { HttpException } = require('nanoms');

nms.createService({
  path: '/error',
  method: 'GET',
  func(req, res) {
    throw new HttpException(/*message*/, /*status code*/):
  }
})

```

## New in v1.4.0

We have refactored most of the request handling, and fixed all major bugs. 90% of the API should be stable.

1. Added support for routing:

```javascript
// Use nms.route() method to route services to a specified path.

/*
 * nms.route(serviceArray, optional[path, createService])
 * serviceArray: Service[]
 * path?: string
 * createService?: boolean
 *
 * returns an array with modified services
 * if createService is set to true NanoMS will create/register these endpoints
 */

const userService = [
    {
        path: '/new',
        method: 'POST',
        async func(req, req) {
            // Store user in db
        },
    },
    {
        path: '/all',
        method: 'GET',
        async func(req, req) {
            //Get all users from db
        },
    },
    {
        path: '/:id',
        method: 'POST',
        async func(req, req) {
            // Get user by id
        },
    },
];

const userRoute = nms.route(userService, '/users', true); // =>
/*
 * POST /users/new
 * GET /users/all
 * GET /users/:id
 */
```

2. Added a static `getInstance()` method that returns an instance of NanoMS

```javascript
// In index.js
const { NanoMS } = require('nanoms');
const nms = new NanoMS(3000);

//---

// In another file
const { NanoMS } = require('nanoms');
const nms = NanoMS.getInstance(); // Returns the instance created in index.js.
```

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
const nms = new NanoMS(3000); // NanoMS accepts a port number
```

5. Specify a body-parsing middleware to be used with the `use()` method

```javascript
/*
  * NanoMS includes two built in middleware functions for parsing
  the request body to url-encoded or JSON format
  
  * You can define and add more built-in, or your own global middleware functions with the use() method
*/

nms.use(NanoMS.json); // or NanoMS.urlEncoded
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
`req` and `res` are direct references to `http.IncomingMessage` and `http.ServerResponse`. We recommend refering to the official NodeJS documentations [Node JS](https://nodejs.org/dist/latest-v12.x/docs/api/).

NanoMS does however offer a few built-in methods, as well as shorthand properties and methods

## API

```javascript
// instance methods
nms.createService(/* { configuration } */); // method for creating services. (see example above)
nms.route(/*serviceArray, [options]*/); // method for routing services.
nms.setStatic(/* path */); // specify path for serving static files
nms.static(/* req, res */); // built-in middleware for serving static files from previously set path (see NanoMS.setStatic)
nms.use(/* middleware function */); // built-in method for specifying global middleware functions. passes on req and res as arguments

// static methods
NanoMS.getInstance(); // static method that returns an instance of NanoMS. Returns null if not instantiated
NanoMS.json(/* req, res */); // built-in body-parsing middleware function (Buffer to JSON)
NanoMS.urlEncoded(/* req, res */); // built-in body-parsing middleware function (Buffer to url-encoded)

req.app; // holds an instance of NanoMS
req.body; // holds the request body. retuns a Buffer if no parsing middleware is used
req.cookies; // holds an object with key value pairs
req.params; // holds an object with key value pairs representing named router parameters and their values.
req.getHeader(/* header */); // returns header or undefined if non-existent
req.query(/* query */); // returns url query. returns undefined in non-existent. returns an object of all url queries by default.
res.status(/* status-code */); // used to specify the status-code to be returned. returns res.
res.send(/* data to be sent */); // used to send back data with the response.
// data types accepted: string, number, object, Buffer...
res.render(/* fileName or path within static folder. Filename extention can be omitted*/); // used inside of service functions for rendering html files
res.redirect(/* url, (optional: status-code) */);
```

List of http exceptions:

-   BadRequestException
-   UnauthorizedException
-   NotFoundException
-   ForbiddenException
-   NotAcceptableException
-   RequestTimeoutException
-   ConflictException
-   GoneException
-   HttpVersionNotSupportedException
-   PayloadTooLargeException
-   UnsupportedMediaTypeException
-   UnprocessableEntityException
-   InternalServerErrorException
-   NotImplementedException
-   ImATeapotException
-   MethodNotAllowedException
-   BadGatewayException
-   ServiceUnavailableException
-   GatewayTimeoutException
