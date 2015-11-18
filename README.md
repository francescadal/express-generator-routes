![General Assembly Logo](https://camo.githubusercontent.com/1a91b05b8f4d44b5bbfb83abac2b0996d8e26c92/687474703a2f2f692e696d6775722e636f6d2f6b6538555354712e706e67)

# Introduction to Express

## Objectives

* Compare and contrast the structure of an Express.js app vs one made using the `http` module.
* Build a simple application using Express and set it running on a port.
* Configure basic routes and enable CORS.
* Explain and use the express concepts of "handler chains" and "middleware"
* Use the `body-parser` middleware to parse POST and PUT/PATCH requests.
* Incorporate middleware `morgan` and `errorhandler` for handling logs and error messages.

## What is Express?
[Express](http://expressjs.com/) is a (relatively) lightweight server-side web framework that's written in JavaScript. We've already seen, with the help of the `http` module, how a web application can be built up in Node; with Express, we'll take it to the next level and make our apps configurable and easily extensible.

Consider a simple web application - People and Pets, where a Person has many Pets. How might we have set that up?

Maybe something like this?

```bash
.
├── app.js
├── controllers
│   ├── applicationController.js
│   ├── peopleController.js
│   └── petsController.js
├── models
│   ├── index.js
│   ├── person.js
│   └── pet.js
├── package.json
└── scripts
    ├── seed.js
    ├── testPersonModel.js
    └── testPetModel.js
```

Here's how an equivalent Express application might look. Keep in mind that both Node and Express are *super-unopinionated* about how we structure our applications, so to a certain extent this structure is arbitrary; we've given you this structure for a reason, though, as you'll see soon.

```bash
.
├── app.js
├── bin
│   └── www
├── models
│   ├── index.js
│   ├── person.js
│   └── pet.js
├── package.json
├── routes
│   ├── index.js
│   ├── people.js
│   └── pets.js
└── scripts
    ├── seed.js
    ├── testPersonModel.js
    └── testPetModel.js
```

Not too dissimilar, right? In fact, if we were to look closely at both `models` folders, we might even discover that they were identical!

One interesting thing about Express that distinguishes it from Rails is that it has no built-in conception of a database - we have to explicitly link it up to whatever sort of data store we're using. In other words, pretty muchg all that Express does is routing, control, and (as appropriate) handling server-side view rendering.

## Basic Express configuration and "Hello World!"

Let's work through building out a very basic Express app together. Please code along.

First, let's get our project set up. Run `npm init` to create a `package.json` file for our new app, and then run `npm install --save express` to download Express.

Next, open up a new file called `app.js` and write the following inside of it.

```javacript
var express = require('express'),
    http = require('http');

var app = express();
```

That's it! We've created our empty Express app. The only thing left to do is to serve it.

At the bottom of your main JS file, write the following:

```javascript
var port = 8000;
var server = http.createServer(app);
server.listen(port, function(){
  console.log("Server is running on port " + port);
});
```

Finally, in the middle of the file, write the following:

```javascript
app.get('/*', function (req, res) {
  res.send('Hello World!');
});
```
>The req object is a [http.IncomingMessage](https://nodejs.org/api/http.html#http_http_incomingmessage)  object. This is what we used in the simple HTTP node server.
>The res object is [http.ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse) object. Also used in the simple HTTP node server

This last thing we've just added is a route - this is what routes look like (more or less) in Express.

To start your new server, just enter `node app.js` in the console and take a look at port 8000. Try visiting a variety of urls - what do you observe?

## Routing

As you can see, defining routes in Express is pretty straightforward. Here's how we might take our app and define some basic routes.

```javascript
app.get('/people', function(req, res){
  res.send("people#index");
});
app.post('/people', function(req, res){
  res.send("people#create");
})
```

Extracting things like IDs from urls is extremely easy with Express - much simpler than doing it by hand.

```javascript
app.get('/people/:id', function(req, res){
  res.send("people#show");
});
app.patch('/people/:id', function(req, res){
  res.send("people#update");
});
app.delete('/people/:id', function(req, res){
  res.send("people#destroy");
});
```

You can also use the `route` method to define multiple routes as a single expression.

```javascript
app.route('/people/:id')
      .get(function(req, res){
        res.send("people#show");
      })
      .patch(function(req, res){
        res.send("people#update");
      })
      .delete(function(req, res){
        res.send("people#destroy");
      });
```

Another option is to create small, modular 'mini-routers', which can then be re-integrated back into Express. This is a common approach when you have lots of routes, and in fact is also the approach being followed in the example above - each file inside the `routes` directory holds a single mini-router, set up as follows.

```javascript
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {    // index
  res.send("people#index");
});
router.post('/', function(req, res, next) {   // create
  res.send("people#create");
});
router.get('/:id', function(req, res, next) { // show
  res.send("people#show");
});
router.patch('/:id', function(req, res, next) { // update
  res.send("people#update");
});
router.delete('/:id', function(req, res, next) { // destroy
  res.send("people#destroy");
});

module.exports = router;
```

These separate stand-alone routers then get brought back together in the main JS file which `require`s them.

```
...
app.use('/', require('./routes/index'));
app.use('/people', require('./routes/people'));
app.use('/pets', require('./routes/pets'));
...
```

In the context of Express, these little 'plug-ins' that get added into the app are called **middleware**. More on middleware later in this lesson.

#### Aside :: Handlers and Handler Chaining

With every route is a handler function which determines how the app will respond to any given request. In Express, a handler will usually take three arguments, but some take two or four.

The three arguments to an ordinary Express handler are **req**, which is the HTTP request object that came from the user; **res**, which is the HTTP response object being prepared by Express; and **next**, which is a callback.

> You can read all about the HTTP Request and HTTP Response objects in the Node or Express documentation, but you'll probably find it easier going if you just dip in when you need something specific.

You may have noticed that even though we said handlers could have three arguments, the ones we have used so far only have two. This is because they are **terminal** handlers:  they contain a statement in them that indicates that our processing of the request is done and the server should send a response.  Terminal handlers do not have a next function for that reason.

Some of the statements that end processing are here:

|Response method|What it means|
|:--------------|:------------|
|`res.end()`| End the response process.|
|`res.json(jsObject)`|  Send a JSON response.|
|`res.redirect()`|  Redirect a request.|
|`res.sendStatus()`|  Set the response status code and send its string representation as the response body.|

Of course, if some handlers are terminal, that means others must be non-terminal; in Express, non-terminal handlers are _chainable_ - the program can flow from one handler to the next. The ability to chain handlers is part of what makes Express so powerful and flexible despite its bare-bones simplicity.

Take a look at the following example.

```javascript
app.get('/contacts', function(req, res, next) {
  if (!res.locals.contacts) {
    res.locals.contacts = [];
  }

  // add first group of contacts (from iPhone/iCloud?)
  res.locals.contacts.push({
    name: 'David',
    phone: '111-222-3333'
  });
  next();
});

app.get('/contacts', function(req, res, next) {
  if (!res.locals.contacts) {
    res.locals.contacts = [];
  }

  // add second group of contacts (from Google/Android?)
  res.locals.contacts.push({
    name: 'Brian',
    phone: '444-555-6666'
  });
  next();
});

app.get('/contacts', function(req, res, next) {
  if (!res.locals.contacts) {
    res.locals.contacts = [];
  }

  // add third group of contacts (from Hotmail?)
  res.locals.contacts.push({
    name: 'Alex',
    phone: '777-888-9999'
  });
  next();
});

app.get('/contacts', function(req, res) {
  res.json(res.locals.contacts);
  res.status(200);
});
```

Look at the page in your browser and notice that the handlers were invoked in the order we defined them.

> [`res.locals`](http://expressjs.com/4x/api.html#res.locals) is a property of the response object that is explicitly for handler functions to store information in.  It persists through the life of the request/response, and is shared across middleware and handlers.

Also notice that we have three ordinary handlers (req, res, next as arguments and one terminal handler (only req and res as arguments, and one of our statements that end processing.

What do you think happens if we do not have a terminal handler? Try it in your browser and see.  Why do you think that happens?

In this case, the handler chain is simple enough that Express can see that it will never terminate.  However, if you do something more complex, the server will simply never respond to that request.

Chained handlers might seem silly at first blush: in the earlier example, very little prevented us from just writing this:

```javascript
app.get('/contacts', function(req, res) {
  res.json([{
    name: 'David',
    phone: '111-222-3333'
  }, {
    name: 'Brian',
    phone: '444-555-6666'
  }, {
    name: 'Alex',
    phone: '777-888-9999'
  }]);

  res.status(200);
});
```

And in fact, in real apps you probably won't write three handlers to do basically the same thing with different strings.

What you will most likely do, however, is write an **authentication handler**, a **content handler**, or a **security logging** handler that needs to run for certain routes.

Being able to chain handlers means that you can make your code **modular** and run only the modules you need (when you need them!) for any given request.

Most web frameworks have this kind of HTTP Request Processing mechanism. For example, in Rails we have before_actions that are invoked for specific controller actions.

### Your Turn :: Express Routing + Handlers

In your project groups, create a simple Express app with a resource 'movies' that responds with JSON (from hard-coded JS objects).

## Commonly Used Express Middleware
As you build a number of different applications in Express, you'll find that there are a few pieces of Express middleware that you'll be reaching for over and over again - they're found in almost every project.

| Middleware | Package Name | Purpose |
|:----------:|:------------:|:-------:|
| Serve-Static | N/A - now bundled in Express | Serve up static pages. |
| CORS | `cors` | Create a CORS policy for the app. |
| BodyParser | `body-parser` | Easily read the body of an incoming request. |
| Morgan | `morgan` | Logging. |
| ErrorHandler | `errorhandler` | Self-explanatory. |

Let's dive into each of these in depth.

### Serve-Static
Remember how, when we were building applications in Rails, we would have a `public` folder for holding static HTML and other assets? Well, [serve-static](https://github.com/expressjs/serve-static) allows us to do the same thing in Express. `serve-static` used to be stand-alone middleware, but ever since ___ it's officially been part of Express, which makes it especially easy to set up - just add the line below to your list of middleware

`app.use(express.static('public'));`

and create a directory called `public`. You're done! Now any static asset (HTML, CSS, JS, images) you put inside `public` will be served up automatically.

#### Your Turn :: Serve-Static

In your teams, create a new small Express app that serves up one of the following three static images (or any other three images that you'd prefer to serve):
- [image one](http://static.memrise.com/uploads/profiles/bearzooka_140515_2354_31.jpg)
- [image two](http://luckysun.info/wp-content/uploads/2015/05/ROBOT-CHEETAH.jpeg)
- [image three](http://www.itsartmag.com/features/itsart/wp-content/uploads/2013/06/monsterfish-breakdown.jpg)

### CORS Middleware
Hope you didn't forget about your old friend CORS! Fortunately, dealing with CORS is Express is pretty easy - just download the CORS middleware via NPM, and then require and use it inside `app.js`.

**Console**

`npm install --save cors`

**app.js**

```javascript
var cors = require('cors');
...
app.use(cors());
```

This will give us a blanket white-list CORS policy, which isn't so great for real life, but is fine for now.

### Body-Parser
Reading the body of an incoming request is mission-critical for just about every possible web application. `body-parser` gives us an easy interface for reading that request body, so that we don't have to worry about (a) loading data chunks one at a time, or (b) making sure that the body is in the right format.

**Console**

`npm install --save body-parser`

**app.js**

`var bodyParser = require('body-parser');`

Once you've `require`d it, you'll need to configure `body-parser`. You have a couple of different options with this, but the primary one that you'll be using is

**app.js**

`app.use(bodyParser.json())`

This will add an additional property, `.body` to the request object that your middleware interacts with, which you can then immediately use to grab data.

**routes/person.js**

```javascript
router.post('/', function(req, res) {   // create
  models.Person.create(req.body).then(function(person){
    res.json(person);
  }, function(err){
    console.error(err);
  });
  // res.send("people#create");
});
```

#### Your Turn :: CORS + Body-Parser

In groups, make another small Express app from scratch. This time, set up a database with a single table using Sequelize and set up standard CRUD routes.

> Hint: If you're feeling stuck, look back to the example app from the beginning of the lesson!

### Morgan, Express's Logging Tool
Back when we were working with Rails, you may or may not have noticed a directory inside your projects called `log`; this is where your Rails app would keep an ongoing record of everything it's ever done. This can be an extremely useful tool for debugging, and is really a core feature for just about any web application.

Naturally, there's a tool to do this in Express as well - `morgan`. To use it, download and require it in the usual way.

Before you use it, there are some configuration settings you'll probably want to use.

```javascript
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream('logs/access.log', {flags: 'a'});

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));
```

Then, create a new directory called `logs` in the root of your project. This is where your logfile will be created.

### ErrorHandler
`errorhandler`, as the name implies, is a piece of middleware that's designed to help manage how errors are handled. Unlike the other middleware mentioned so far, **`errorhandler` is for use in development _only_**; this is because `errorhandler` sends its full stack trace back to the client anytime there's an error, and that is _not_ something you want to happen in production.

**Console**

`npm install --save-dev errorhandler`

**app.js**

```javascript
var errorhandler = require('errorhandler');
...
...
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler())
}
```

> One other thing to be aware of with Express that 404 errors are **_not_** handled by default, so you'll need to create a catch-all route to handle them. An example of this is below:
```javascript
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
  // Error handler is `use`d next, so 'next' refers to it. This line calls that error handler with the new error
});
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler())
}
```

#### Your Turn :: Morgan + ErrorHandler

Take your applications from the previous activity and add in `morgan` and `errorhandler` for logging!

[License](LICENSE)
------------------

Source code distributed under the MIT license. Text and other assets copyright
General Assembly, Inc., all rights reserved.
