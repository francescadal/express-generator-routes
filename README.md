![General Assembly Logo](https://camo.githubusercontent.com/1a91b05b8f4d44b5bbfb83abac2b0996d8e26c92/687474703a2f2f692e696d6775722e636f6d2f6b6538555354712e706e67)

# Express: Generator, Routes, and Middleware

## Objectives

- Compare and contrast the structure of an Express.js app vs one made using the `http` module.
- Build a simple application using Express and set it running on a port.
- Configure basic routes and enable CORS.
- Explain and use the express concepts of "handler chains" and "middleware"
- Use the `body-parser` middleware to parse POST and PUT/PATCH requests.
- Incorporate middleware `morgan` and `errorhandler` for handling logs and error messages.

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

One interesting thing about Express that distinguishes it from Rails is that it has no built-in conception of a database - we have to explicitly link it up to whatever sort of data store we're using. In other words, pretty much all that Express does is routing, control, and (as appropriate) handling server-side view rendering.

Let's create a new express app.

## Install Express Generator

Express generator, known to `npm` as `express-generator`, is something that will save you more time and typing than you can measure when starting an express back-end. It's like `rails-api new`, but for express apps.

Like most node packages, we will be installing `express-generator` with `npm`.

```bash
npm install -g express-generator
```

Run this command to verify that `express-generator` has been successfully installed:

```bash
express -h
```

If successful, you should see this output:

```bash
Usage: express [options] [dir]

Options:

  -h, --help          output usage information
  -V, --version       output the version number
  -e, --ejs           add ejs engine support (defaults to jade)
      --hbs           add handlebars engine support
  -H, --hogan         add hogan.js engine support
  -c, --css <engine>  add stylesheet <engine> support (less|stylus|compass|sass) (defaults to plain css)
      --git           add .gitignore
  -f, --force         force on non-empty directory
```

## Generate a New Express App

For your own projects, you should follow these steps when creating a new express app:

- [ ] Create express project directory. (`mkdir my-express-api`)
- [ ] Change into your project directory. (`cd my-express-api`)
- [ ] Initialize an empty git repository. (`git init`)
- [ ] Generate your express app. (`express --hbs --git --force`)
- [ ] Perform your initial commit. (`git add . && git commit -m 'Initial commit'`)
- [ ] Install dependencies. (`npm install`)
- [ ] Check that your working directory is still clean. (`git status`)
- [ ] Start your new app to confirm it works. (`DEBUG=my-express-api:* npm start`)

For this lesson, we will be running `express` right in this repo's directory. We want it to use Handlebars for view rendering, since that's what we're familiar with, so we use the `--hbs` flag. It would be bad if we uploaded all of our `node_modules` to GitHub, so go ahead and use the `--git` flag to generate a `.gitignore` file. Finally, we specify `.` for the directory to create files in. It will ask us to confirm since this is a non-empty directory.

```bash
express --hbs --git .
```

Now, take a look around at what `express` has generated for us:

```bash
ls -lah
```

You should see a directory listing that resembles this:

```bash
drwxr-xr-x 11 jeffh staff  374 Nov 18 17:49 ./
drwxr-xr-x 34 jeffh staff 1.2K Nov 18 17:44 ../
drwxr-xr-x 12 jeffh staff  408 Nov 18 17:49 .git/
-rw-r--r--  1 jeffh staff  563 Nov 18 17:45 .gitignore
-rw-r--r--  1 jeffh staff 1.5K Nov 18 17:45 app.js
drwxr-xr-x  3 jeffh staff  102 Nov 18 17:45 bin/
drwxr-xr-x 64 jeffh staff 2.2K Nov 18 17:49 node_modules/
-rw-r--r--  1 jeffh staff  331 Nov 18 17:45 package.json
drwxr-xr-x  5 jeffh staff  170 Nov 18 17:45 public/
drwxr-xr-x  4 jeffh staff  136 Nov 18 17:45 routes/
drwxr-xr-x  5 jeffh staff  170 Nov 18 17:45 views/
```

## Explore Your New Express App

### [`package.json`](package.json)

This is the `npm` package file for your application. It's like your `Gemfile` for your Rails projects. It contains various metadata, most importantly dependencies and development-only dependencies. Have a look at its contents by opening it up in your editor or with `less package.json`.

You should see something like this:

```json
{
  "name": "my-express-api",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "node ./bin/www"
  },
  "dependencies": {
    "body-parser": "~1.13.2",
    "cookie-parser": "~1.3.5",
    "debug": "~2.2.0",
    "express": "~4.13.1",
    "hbs": "~3.1.0",
    "morgan": "~1.6.1",
    "serve-favicon": "~2.3.0"
  }
}
```

### [`app.js`](app.js)
This file sets up and configues your `app`, the result of the `express` factory function (not to be confused with the command-line program).

```javascript
var express = require('express'); // use the `express` module from npm
// ...
var app = express(); // calling the express factory function returns an app
```

This is the core of our application. It wraps around an instance `http.Server` and provides a rich interface for us to build our back-end.

Since the goal of `express`, the web back-end framework, is to provide routing and act as the glue that holds your back-end together, this file will be the center of your application.

```
var routes = require('./routes/index');
var users = require('./routes/users');
// ...
app.use('/', routes);
app.use('/users', users);
```

### [`routes/index.js`](routes/index.js)

In this file, we create and outfit a `Router`, then export it as a module. We consume the module in our `app.js`, mounting them on our `app` (see above).

```javascript
var express = require('express'); // use the express module in this file
var router = express.Router(); // use the router module from express

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router; // export the router object so we can use it in app.js
```

Creating `Routers` like this lets us organize our routes better. We can put all routes with the same prefix on the same router, then mount it on our `app` our another router.

### `routes/*.js`

As above, these files serve to group our routes together. If you have a `routes/users.js` file, then you are expected to mount it on your app at path `'/users'`. `routes/index.js` is expected to be mounted on `/`.

### `public/*`

This directory contains all your static assets. Things like CSS stylesheets, page scripts, and HTML pages belong here, each in their own subdirectory.

We won't be using this very much unless we use the `serve-static` middleware. In production, we'll rarely serve files from our express application, instead using a "true" web server to serve static content, since that is what they are frequently optimized for.

### `views/*`

This is where your view templates go. This is only relevant for server-side templating, where we serve dynamically generated pages using templates and data available to our application, such as database rows or documents, from the server rather than serving JSON data and offloading the template rendering to the client-side.

Server-side templating is a valid approach, but is most useful in a limited subset of cases. One example is when rendering your templates requires data that you want to keep hidden from the client.

What sort of templates we have here will depend on the templating engine we chose when running the generator. The generator will give us some starter templates to start off with and embellish as we go.

### [`bin/www`](bin/www)

This is our start script. In fact, the express generator sets up `npm start` to run `node ./bin/www`. This script requires `app.js`, which exports `app` as a module, and uses `app` for what it was meant to do: be the callback for an instance of `http.Server`!

This is the file where we do startup-related things. If we want to sync our database models before listening for connections, this is where we write that code.

This is also one place where we can take care of out application's termination handlers. `process` is accessible anywhere, but this is the most appropriate place to set handlers for signals the process may or will receive that indicate that it is time to shut down. In these handlers, we can clean things up -- e.g., close database connections -- and call `process.exit`.

### `models/*`

This is where your database models go. We'll gloss over this for now because we will have ample opportunity to discuss it as it comes up in following lessons.

### `lib/*`

This is where we place our configuration and miscellaneous files. By having out configuration constants as modules, we make it easy for ourselves (and others) to modify them for special cases or deployment.

### `log/*`

This is where you have your logging middleware write logs. Make sure to add this directory to your `.gitignore`! If you use the `--git` flag when using `express-generator`, you should be fine.

## How Does Routing Compare with Rails?

Defining routes in Express is pretty straightforward. Here's how we might take our app and define some basic routes. Note, we're just sending back strings to the client for these examples. These strings should serve (no pun) to compare express routes to Rails routes.

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

Usually, though, we want modular 'mini-routers', which can then be re-integrated back into Express. This is a common approach when you have lots of routes, and in fact is also the approach being followed in the example above - each file inside the `routes` directory holds a single mini-router, set up as follows.

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

These separate stand-alone routers then get brought back together in the main JS file which `require`s them. The URL parts of the routes get concatenated when we define routers in modules and `.use` them.

```
...
app.use('/', require('./routes/index'));
app.use('/people', require('./routes/people')); // what would the full route to people#index be?
app.use('/pets', require('./routes/pets'));
...
```

In the context of Express, these little 'plug-ins' that get added into the app are called **middleware**.

## What A `req`: Handlers and Handler Chaining

With every route is a handler function which determines how the app will respond to any given request. In Express, a handler will usually take three arguments, but some take two or four.

The three arguments to an ordinary Express handler are **req**, which is the HTTP request object that came from the user; **res**, which is the HTTP response object being prepared by Express; and **next**, which is a callback.

---

>The req object is a [http.IncomingMessage](https://nodejs.org/api/http.html#http_http_incomingmessage)  object. This is what we used in the simple HTTP node server.

---

>The res object is [http.ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse) object. Also used in the simple HTTP node server

---

> You can read all about the HTTP Request and HTTP Response objects in the Node or Express documentation, but you'll probably find it easier going if you just dip in when you need something specific.

---

You may have noticed that even though we said handlers could have three arguments, the ones we have used so far only have two. This is because they are **terminal** handlers:  they contain a statement in them that indicates that our processing of the request is done and the server should send a response.  Terminal handlers do not have a next function for that reason.

Some of the statements that end processing are here:

| Response method      | What it means                                                                         |
| :------------------- | :------------------------------------------------------------------------------------ |
| `res.end()`          | End the response process.                                                             |
| `res.json(jsObject)` | Send a JSON response.                                                                 |
| `res.redirect()`     | Redirect a request.                                                                   |
| `res.sendStatus()`   | Set the response status code and send its string representation as the response body. |

Of course, if some handlers are terminal, that means others must be non-terminal; in Express, non-terminal handlers are _chainable_ - the program can flow from one handler to the next. The ability to chain handlers is part of what makes Express so powerful and flexible despite its bare-bones simplicity.

## Exercise: Explore Handlers

Edit your express app to use the following routes.

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

## Lab: Create A Movies API

In your project groups, create a simple Express app with a resource 'movies' that responds with JSON (from hard-coded JS objects).

## Commonly Used Express Middleware

As you build a number of different applications in Express, you'll find that there are a few pieces of Express middleware that you'll be reaching for over and over again - they're found in almost every project.

| Middleware   | Package Name                 | Purpose                                      | Installed by Generator? |
| :----------: | :--------------------------: | :------------------------------------------: | :---------------------: |
| Serve-Static | N/A - now bundled in Express | Serve up static pages.                       | :white_check_mark:      |
| CORS         | `cors`                       | Create a CORS policy for the app.            | :no_entry_sign:         |
| BodyParser   | `body-parser`                | Easily read the body of an incoming request. | :white_check_mark:      |
| Morgan       | `morgan`                     | Logging.                                     | :white_check_mark:      |
| ErrorHandler | `errorhandler`               | Self-explanatory.                            | :no_entry_sign:         |

### `serve-static`

Remember how, when we were building applications in Rails, we would have a `public` folder for holding static HTML and other assets? Well, [serve-static](https://github.com/expressjs/serve-static) allows us to do the same thing in Express. Just hook it up to your app and pass it a folder name to use it.

```javascript
app.use(express.static('public'));
```

Now any static asset (HTML, CSS, JS, images) you put inside `public` will be served up automatically.

#### Lab: Serve-Static

In your teams, create a new small Express app that serves up one of the following three static images (or any other three images that you'd prefer to serve):

- [image one](http://static.memrise.com/uploads/profiles/bearzooka_140515_2354_31.jpg)
- [image two](http://luckysun.info/wp-content/uploads/2015/05/ROBOT-CHEETAH.jpeg)
- [image three](http://www.itsartmag.com/features/itsart/wp-content/uploads/2013/06/monsterfish-breakdown.jpg)

### `cors`

If you deploy your API to heroku, but deploy your front-end to GitHub, pay attention!

Fortunately, dealing with CORS is Express is pretty easy - just download the CORS middleware via NPM, and then require and use it inside `app.js`.

```bash
npm install --save cors
```


```javascript
// app.js

var cors = require('cors');
//...
app.use(cors());
```

This will give us a blanket white-list CORS policy, which isn't so great for real life, but is fine for now.

### `body-parser`

Reading the body of an incoming request is mission-critical for just about every possible web application. `body-parser` gives us an easy interface for reading that request body, so that we don't have to worry about (a) loading data chunks one at a time, or (b) making sure that the body is in the right format.

```javascript
// app.js

var bodyParser = require('body-parser');
// ...
app.use(bodyParser.json());
```

This will add an additional property, `.body` to the request object that your middleware interacts with, which you can then immediately use to grab data.

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

### `morgan`

Back when we were working with Rails, you may or may not have noticed a directory inside your projects called `log`; this is where your Rails app would keep an ongoing record of everything it's ever done. This can be an extremely useful tool for debugging, and is really a core feature for just about any web application.

```javascript
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream('logs/access.log', {flags: 'a'});

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));
```

Create a new directory called `logs` in the root of your project. If you skip this, you will get an error!

### ErrorHandler
`errorhandler`, as the name implies, is a piece of middleware that's designed to help manage how errors are handled. Unlike the other middleware mentioned so far, **`errorhandler` is for use in development _only_**; this is because `errorhandler` sends its full stack trace back to the client anytime there's an error, and that is _not_ something you want to happen in production.

```
npm install --save-dev errorhandler # notice the flag!
```


```javascript
// app.js

var errorhandler = require('errorhandler');
// ...
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler())
}
```

One other thing to be aware of with Express that 404 errors are **_not_** handled by default, so you'll need to create a catch-all route to handle them. An example of this is below:

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

[License](LICENSE)
------------------

Source code distributed under the MIT license. Text and other assets copyright
General Assembly, Inc., all rights reserved.
