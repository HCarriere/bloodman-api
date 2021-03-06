'use strict';
// app.js

//imports
const express   = require('express')
const path      = require('path')
const bodyParser= require('body-parser')
const http		= require('http')

//General conf
const mongo     = require('./app/mongo')
const config    = require('./config') //config file
const app       = express();
const port      = process.env.PORT || config.server.port;
const expressServer 	= http.createServer(app);

const CORS = process.env.CORS || '*';
//Express configuration
app
.use(express.static(__dirname + '/views/assets'))   //styles
.use(express.static(__dirname + '/uploads'))        //uploads
.use(bodyParser.json() )        // to support JSON-encoded bodies
.use(bodyParser.urlencoded({    // to support URL-encoded bodies
  extended: true
}))

const scores = require('./app/scores');
//headers

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', CORS);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});



// routes
app

.get('/api/getBestRun/:map', (req, res) => {	
	scores.getBestRun(req, (data) => {
        res.status(data.httpCode);
        res.json(data.body);
    });
})


.get('/api/getAttempts/:map', (req, res) => {	
	scores.getAttempts(req, (data) => {
        res.status(data.httpCode);
        res.json(data.body);
    });
})


.post('/api/saveRun', (req, res) => {	
	scores.saveRun(req, (data) => {
        res.status(data.httpCode);
        res.json(data.body);
    });
})





//////////// Error handler //////////
app.use((err, request, response, next) => {  
  console.log(err);
  
});


//application launch
expressServer.listen(port, (err) => {
    if(err) {
        return console.log('launching error on port '+port, err)
    }
    console.log('expressServer running on '+port);
    console.log('app ready');
});





