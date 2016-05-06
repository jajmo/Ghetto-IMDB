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
                return listOfMovies[0];
            });
    };

    //get a list of movies by a list of ids
    exports.getMoviesByIDs = function (ids) {
        return movieCollection
            .find({ _id: { $in: ids }})
            .toArray();
    };

    //get a list of movies by a title
    exports.getMoviesByTitle = function (title) {
        if (!title) {
            return Promise.reject('You must provide a title');
        }

        return movieCollection
            .find({ title: { $regex: '.*' + title + '.*', $options: 'i' } })
            .toArray();
    };

    //get a list of movies by a genre
    exports.getMoviesByGenre = function (genre) {
        if (!genre) {
            return Promise.reject('You must provide a genre');
        }

        return movieCollection
            .find({ genre: { $regex: '.*' + genre + '.*', $options: 'i' } })
            .toArray();
    };

    //get a list of movies by an actor
    exports.getMoviesByActor = function (actor) {
        if (!actor) {
            return Promise.reject('You must provide a actor');
        }

        return movieCollection
            .find({ actors: { $regex: '.*' + actor + '.*', $options: 'i' } })
            .toArray();
    };

    //get a list of movies by director
    exports.getMoviesByDirector = function (director) {
        if (!director) {
            return Promise.reject('You must provide a director');
        }

        return movieCollection
            .find({ director: { $regex: '.*' + director + '.*', $options: 'i' } })
            .toArray();
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
        return movieCollection
            .findOne({ _id: id })
            .then(function (movie) {
                return movie !== undefined;
            });
    };

    exports.addMovie = function (title, year) {
        // Let's get some API in here
        return new Promise(function (resolve, reject) {
            request(
                encodeURI('http://omdbapi.com?t=' + title + '&y=' + year),
                function (error, response, body) {
                    var movie = JSON.parse(body);
                    if (!movie.Error) {
                        var doc = {
                            _id: uuid.v4(),
                            title: movie.Title,
                            description: movie.Plot,
                            genre: movie.Genre.split(', '),
                            image: movie.Poster,
                            actors: movie.Actors,
                            director: movie.Director,
                            userVotes: [],
                            criticRating: movie.imdbRating
                        };

                        movieCollection.findOne({ title: movie.Title }).then(function (res) {
                            if (!res) {
                                movieCollection.insertOne(doc);
                                resolve(doc);
                            } else {
                                resolve(res);
                            }
                        });
                    } else {
                        reject('Invalid movie');
                    }
                }
            );
        });
    };

    exports.voteOnMovie = function (id, rating, uid) {
        if (!rating || rating > 10) {
            return Promise.reject('Invalid rating: ' + rating);
        }

        return movieCollection.findOne({ _id: id, "userVotes.userID": { $ne: uid }}).then(function (movie) {
            if (!movie) {
                return Promse.reject('Invalid movie');
            } else {
                movieCollection.update({ _id: movie._id },
                    {
                        $push: { userVotes: { userID: uid, rating: rating }}
                    }
                ).then(function (res) {
                    return 'Good';
                });
            }
        });
    };
});


