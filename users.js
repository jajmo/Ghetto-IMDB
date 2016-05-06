var MongoClient   = require('mongodb').MongoClient
    , settings      = require('./config.js')
    , uuid          = require('node-uuid')
    , movies        = require('./movies.js');

var fullMongoUrl  = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports       = module.exports = {};

MongoClient.connect(fullMongoUrl)
.then(function(db) {
    return db.createCollection('users');
}).then(function (userCollection) {

    // Update a user's profile
    exports.updateProfile = function (uid, profileText, realName, password) {
        var updateSet = {
            profileText: profileText.trim(),
            realName: realName
        };

        if (password) {
            updateSet.encryptedPassword = password;
        }

        return userCollection.update({ _id: uid }, { $set : updateSet});
    };

    // Check if a user is logged in
    exports.isLoggedIn = function (cookieValue, response) {
        return userCollection
            .findOne({ currentSessionId: cookieValue })
            .then(function (doc) {
                if (doc === null && cookieValue !== undefined) {
                    var anHourAgo = new Date();
                    anHourAgo.setHours(anHourAgo.getHours() - 1);
                    response.cookie(settings.cookieName, '', { expires: anHourAgo });
                    response.clearCookie(settings.cookieName);
                }

                return doc;
            });
    };

    // Log a user in
    exports.login = function (username, passwordMatch, response) {
        if (!username || !passwordMatch) {
            return Promise.reject();
        }

        return userCollection
            .findOne({ username: username })
            .then(function (user) {
                if (user == null) {
                    return Promise.reject();
                }

                var sessID = uuid.v4();
                return userCollection.updateOne(
                        { username: username },
                        { $set: { currentSessionId: sessID }}
                    ).then(function (res) {
                        response.cookie(settings.serverConfig.cookieName, sessID);
                        return '1';
                    });
            });
    };

    // Get a user's password hash for client-side comparison
    // We don't want to send plaintext passwords!
    exports.getPassHash = function (username) {
        if (!username) {
            return Promise.reject();
        }

        return userCollection
            .findOne({ username: username })
            .then(function (user) {
                return user.encryptedPassword;
            });
    };

    // Log a user out
    exports.logout = function (cookieValue, response) {
        return userCollection
            .update(
                { currentSessionId: cookieValue },
                { $set: { currentSessionId: null }}
            ).then(function (res) {
                var anHourAgo = new Date();
                anHourAgo.setHours(anHourAgo.getHours() - 1);
                response.cookie(
                    settings.serverConfig.cookieName,
                    '',
                    { expires: anHourAgo }
                );
                response.clearCookie(settings.serverConfig.cookieName);
            });
    };

    // Create a user
    exports.createUser = function (username, passwordHash, realName) {
        if (!username || !passwordHash) {
            return Promise.reject('You must enter a username and password');
        }

        return userCollection
            .find({ username: username })
            .toArray()
            .then(function (result) {
                return result.length;
            }).then(function (length) {
                if (length > 0) {
                    return Promise.reject('User already exists');
                }

                var userObject = {
                    _id: uuid.v4(),
                    username: username,
                    encryptedPassword: passwordHash,
                    currentSessionId: null,
                    realName: realName,
                    profileText: null,
                    movies: [],
					featuredMovie: {
						_id: null,
						title: null,
						cover: null
					}
                };

                userCollection.insertOne(userObject);

                return 'Account created. You can now login';
            });
    };

    exports.getAllMovies = function (uid) {
        return userCollection
            .findOne({ _id: uid, 'movies.$.state': settings.serverConfig.watched })
            .then(function (result) {
                var ids = [];

                if (result) {
                    result.movies.forEach(function (movie) {
                        ids.push(movie.id);
                    });
                }

                return ids;
            });
    };

    exports.watchMovie = function (mid, uid, state) {
        return movies.movieExists(mid).then(function (movie) {
            if (!movie) {
                return Promise.reject('Invalid movie ID');
            }

            var insert = {
                id: mid,
                state: state
            };

            userCollection
                .update({ _id: uid }, { $addToSet: { movies: insert }})
                .then(function (res) {
                    return 1;
                });
        });
    };

    exports.getUserByUsername = function (username) {
        return userCollection.findOne({ username: username });
    };
	
	exports.setFeaturedMovie = function(uid, mid) {
		return movies.getMovie(mid).then(function(movie) {
			if(!movie) {
				return Promise.reject('Invalid movie ID');
			}
			userCollection
				.update({ _id: uid }, { $set: { "featuredMovie._id": mid, "featuredMovie.title": movie.title, "featuredMovie.cover": movie.image }})
				.then(function (res) {
                    return 1;
                });


		});
	};

    exports.removeMovie = function (mid, uid) {
        if (!mid || !uid) {
            return;
        }

        return userCollection.update({ _id: uid }, { $pull: { movies: { id: mid }}}).then(function (res) {
            return movies.pullVote(mid, uid);
        });
    };
});
