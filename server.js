'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var expect      = require('chai').expect;
var cors        = require('cors');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var helmet        = require('helmet');

var app = express();

app.use(helmet());

//The original backend test wouldn't allow for inline scripts which breaks the web interface, I modified to allow local inline
/*app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],    //Note: this breaks the web page interface - won't load jQuery or inline scripts, but apparently required to pass tests
    styleSrc: ["'self'"]
    //,scriptSrc: ["'self'", "'unsafe-inline'", "https://code.jquery.com/jquery-2.2.1.min.js"]  //This line  would fix the front page but the test doesn't like it. You can't even use a nonce
  }
}))*/
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],    //Note: this breaks the web page interface - won't load jQuery or inline scripts, but apparently required to pass tests
    styleSrc: ["'self'","'unsafe-inline'"]
   ,scriptSrc: ["'self'", "'unsafe-inline'"]  //This line  would fix the front page but the test doesn't like it. You can't even use a nonce
  }
}))
  
app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
