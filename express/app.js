/*
* MODULES
* ---------------------------------------------------------------------
*
* import required modules.
* express - underlying web framework 
* mysql - underlying database
* stylus - css pre-processor, convert .styl to css
* nib - support stylus, utilities/mixins
* morgan - logging
* path - file system path manipulation
* fs - access file system
*/
var application_root = __dirname;
var express = require("express");
var mysql = require('mysql');
var stylus = require('stylus');
var nib = require('nib');
var morgan = require('morgan');
var path = require("path");
var fs = require("fs");

/*
* Application instance
*/
var app = express();

/*
* Get configuration
*/
var contents = fs.readFileSync("./config.json");
var config = JSON.parse(contents);

/*
* CONFIGURATION
* ----------------------------------------------------------------------
*
* Database connection
* host - server 
* user - database username
* password - database password
* database - database name
*/
var connection = mysql.createConnection({
  host : config.host,
  user : config.user,
  password : config.password,
  database: config.database
});

// port to listen to
app.set('port', process.env.PORT || config.port);

// location of templates
app.set('views', application_root + '/views');

// view engine
app.set('view engine','jade');

// log incoming requests to console
app.use(morgan());


// middleware to compile 'styl' files to css
app.use(stylus.middleware({
  // Source directory where our styl files are located
  src: __dirname + '/public',
  // Destination directory where .styl resources are compiled
  dest: __dirname + '/public',
    // Compile function, compress css, use nib utilities/mixins
    compile: function(str, path) {
      return stylus(str)
        .set('filename', path)
        .set('compress', true)
        .use(nib());
    }
}));

// location of static files ie stylesheets & images
app.use(express.static(path.join(application_root, "/public")));

/*
* ROUTERS
* ------------------------------------------------------------------------------
*/

// default route, display home page
app.get('/', function (req, res) {
  res.render('index', {title:'Home'});
});

// get all messages and display
app.get('/cheki', function (req, res) {
   connection.query('SELECT * FROM message', function (error, rows, fields) {
         res.render('cheki',{title:'Cheki','users':rows});
      });
});

/*
* EXECUTE
* ------------------------------------------------------------------------------
*/
app.listen(app.get('port'), function(){
	console.log("Matumizi server listening at port " + app.get('port'));
});
