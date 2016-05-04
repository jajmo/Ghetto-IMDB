var MongoClient = require('mongodb').MongoClient
    , settings = require('./config.js')
    , uuid = require('node-uuid')
    , request = require('request');

var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports = module.exports = {};

MongoClient.connect(fullMongoUrl)
.then(function(db) {
    var movieCollection = db.collection('movies');


    exports.getAllMovies = function() {
        return movieCollection.find().toArray();
    };


    exports.getMovie = function(id) {
        if (!id) {
            return Promise.reject('You must provide an ID');
        }

        return movieCollection
            .find({ _id: id })
            .limit(1)
            .toArray()
            .then(function(listOfMovies) {
                if (listOfMovies.length === 0) {
                    throw new ReferenceError('Could not find movie with id of ' + id);
                }

                return listOfMovies[0];
            });
    };


    exports.updateMovie = function(id, newTitle, newRating) {
        if (!id) {
            return Promise.reject('You must provide an ID');
        }
        if (!newTitle) {
            return Promise.reject('You must provide a title');
        }
        if (
            newRating == null ||
            newRating === undefined ||
            newRating < 0 ||
            newRating > 5
        ) {
            return Promise.reject('You have provided an invalid rating');
        }

        return movieCollection
            .updateOne({ _id: id }, { title: newTitle, rating: newRating })
            .then(function() {
                return exports.getMovie(id);
            });
    };


    exports.deleteMovie = function (id) {
        if (!id) {
            return Promise.Reject('You must provide an ID');
        }

        return movieCollection
            .deleteOne({ _id: id })
            .then(function(deletionInfo) {
                if (deletionInfo.deletedCount === 0) {
                    throw new ReferenceError('Could not find the document with this id to delete');
                }

                return true;
            });
    };

    exports.addMovie = function (title, year) {
        // Let's get some API in here
        request(encodeURI("http://omdbapi.com?t=" + title + "&y=" + year), function (error, response, body) {
            var movie = JSON.parse(body);
            if (!movie.error) {
                var doc = {
                    title: movie.Title,
                    description: movie.Plot,
                    genre: movie.Genre.split(", "),
                    image: movie.Poster,
                    actors: movie.Actors,
                    director: movie.Director,
                    userRating: 0,
                    criticRating: movie.imdbRating
                };

                movieCollection.insertOne(doc);
            }
        });
    };

});


