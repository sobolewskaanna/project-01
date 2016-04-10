// require express
var express = require('express');

// require and load dotenv
var dotenv = require('dotenv').load();

//generate a new express app and call it 'app'
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var request = require('request');

//serve static files in public
app.use(express.static('public'));

//body parser configuration to accept datatypes
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

/////DATABASE
var database = require('./models');


/////HTML ENDPOINTS
//localhost3000/
app.get('/', function homepage (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
// goes to localhost3000/searches/somekindofId
app.get('/searches/:id', function searchResult (req, res) {
  res.sendFile(__dirname + '/views/search_result.html');
});


////JSON API ENDPOINTS

app.post('/api/searches', function (req, res) {
  var newSearch = database.Search ({
    query: req.body.query,
    city: req.body.city
  });
  newSearch.save(function(err, search){
    if (err) {
      res.send(err);
    } else {
      res.json(search);
    }
  });
});


app.get('/api/searches/:id/results', function (req, res) {
  database.Search.findById(req.params.id, function (err, search) {
    var searchQuery = search.query;
    var foursquareClientId = process.env.FOURSQUARE_CLIENT_ID;
    var foursquareClientSecret = process.env.FOURSQUARE_CLIENT_SECRET;
    var requestUrl = 'https://api.foursquare.com/v2/venues/search?ll=37.775,-122.419&query=' + searchQuery +'&client_id=' + foursquareClientId + '&client_secret=' + foursquareClientSecret + '&v=20140806&m=swarm';

    if (err) {
      res.send(err);
    } else {
      request.get(requestUrl, function (error, response, body) {
        if (error) {
          console.log('error receiving data from fourquare API', error);
        } else {
          console.log('received this from fourquare API');
          var foursquareApiOutput = JSON.parse(body);
          var randomSelection = Math.floor((Math.random()*10) + 1);
          var restaurantId = foursquareApiOutput.response.venues[randomSelection].id;
          var venueName = foursquareApiOutput.response.venues[randomSelection].name;
          var venueLocation = foursquareApiOutput.response.venues[randomSelection].location.formattedAddress;
          // var rating = foursquareApiOutput.response.venues[randomSelection].rating;

          var newResult = database.Result ({
            venueName: venueName,
            venueLocation: venueLocation
          });
          res.json(venueName + venueLocation);
        }
      });
    }
  });
});

app.get('/api/searches', function (req, res) {

});

////SERVER
//listen on port 3000
app.listen(process.env.PORT || 3000, function () {
  console.log('Express server is running on http://localhost:3000/');
});
