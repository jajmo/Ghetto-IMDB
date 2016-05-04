var MongoClient = require('mongodb').MongoClient
    , settings = require('./config.js')
    , uuid = require('node-uuid')
    , request = require('request');

var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports = module.exports = {};

MongoClient.connect(fullMongoUrl)
.then(function(db) {
    var movieCollection = db.collection('movies');


    //= functions to get movie(s) ==============================================

    //get a list of all movies
    exports.getAllMovies = function() {
        return movieCollection.find().toArray();
    };

    //get a single movie by id
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

    //get a list of movies by a list of ids
    exports.getMoviesByIDs = function (ids) {
        return movieCollection.find({ _id: { $in: ids }}).toArray();
    };

    //get a list of movies by a title
    exports.getMoviesByTitle = function (title) {
        if (!title) {
            return Promise.reject('You must provide a title');
        }
        // TODO:
    };

    //get a list of movies by a genre
    exports.getMoviesByGenre = function (genre) {
        if (!genre) {
            return Promise.reject('You must provide a genre');
        }
        // TODO:
    };

    //get a list of movies by an actor
    exports.getMoviesByActor = function (actor) {
        if (!actor) {
            return Promise.reject('You must provide a actor');
        }
        // TODO:
    };

    //get a list of movies by director
    exports.getMoviesByDirector = function (director) {
        if (!director) {
            return Promise.reject('You must provide a director');
        }
        // TODO:
    };


    //= all other operations ===================================================

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

    exports.movieExists = function (id) {
        return movieCollection.findOne({ _id: id }).then(function (movie) {
            return movie !== undefined;
        });
    };

    exports.addMovie = function (title, year) {
        movieCollection.findOne({ title: title }).then(function (res) {
            if (!res) {
                // Let's get some API in here
                request(encodeURI("http://omdbapi.com?t=" + title + "&y=" + year), function (error, response, body) {
                    var movie = JSON.parse(body);
                    if (!movie.error) {
                        var doc = {
                            _id: uuid.v4(),
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
            }
        });
    };
});


