var express       = require('express');
var bodyParser    = require('body-parser');
var movieData     = require('./movies.js');
var userData      = require('./users.js');
var bcrypt        = require('bcrypt-nodejs');
var cookieParser  = require('cookie-parser');
var config        = require('./config.js');

var app           = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use('/assets', express.static('static'));

// Routes that only authenticated users can view
// Supports regex
var restrictedRoutes = [
    /\/profile*/,
    /\/settings*/,
    /\/movies\/my*/,
    /\/api\/user*/,
    /\/api\/movies*/,
    /\/submit*/
];

app.use(function (request, response, next) {
    var cookieVal = (request.cookies !== undefined)
                                    ? request.cookies[config.serverConfig.cookieName]
                                    : null
        , url = request.url;

    userData.isLoggedIn(cookieVal, response).then(function (res) {
        if (res !== null && cookieVal !== undefined) {
            response.locals.user = res;
        } else {
            response.locals.user = null;
            restrictedRoutes.forEach(function (route) {
                if (route.test(url)) {
                    response.redirect('/');
                    next('Access to \'' +
                             request.url +
                             '\' disallowed. Redirecting to \'/\'');
                }
            });
        }

        next();
    });
});

app.get('/', function (request, response) {
    movieData.getAllMovies().then(function (moviesList) {
        var movies = [];

        moviesList.forEach(function (movie) {
            movie.genre.forEach(function (genre) {
                if (!movies[genre]) {
                    movies[genre] = [];
                }

                movies[genre].push(movie);
            });
        });

        response.render('pages/index', {
            pageTitle: 'Browse',
            pageHeader: 'Browse Movies',
            movies: movies,
            user: response.locals.user,
            watchOptions: config.serverConfig.watchOptions
        });
    });
});

/** Movie routes **/
app.get('/movie/:id', function (request, response) {
    movieData.getMovie(request.params.id).then(function (movie) {
        if (!movie) {
            response.redirect('/');
        } else {
            response.render('pages/movie', {
                user: response.locals.user,
                movie: movie,
                pageTitle: movie.title
            });
        }
    });
});

app.get('/submit', function (request, response) {
    response.render('pages/submitMovie', { user: response.locals.user });
});

app.post('/search', function (request, response) {
    var query = request.body.search;

    //empty searches go back to the browse page
    if (!query || query === '')
        response.redirect('/');

    //query the database for matches in multiple categories
    movieData.getMoviesByTitle(query).then(function (titleList) {
        movieData.getMoviesByGenre(query).then(function (genreList) {
            movieData.getMoviesByActor(query).then(function (actorList) {
                movieData.getMoviesByDirector(query).then(function (directorList) {
                    //dat indent tho
                    var movies = [];

                    //populate the 'movies' list with search matches by category
                    titleList.forEach(function (movie) {
                        if (!movies['By Title']) {
                            movies['By Title'] = [];
                        }

                        movies['By Title'].push(movie);
                    });
                    genreList.forEach(function(movie) {
                        if (!movies['By Genre']) {
                            movies['By Genre'] = [];
                        }

                        movies['By Genre'].push(movie);
                    });
                    actorList.forEach(function(movie) {
                        if (!movies['By Actors']) {
                            movies['By Actors'] = [];
                        }

                        movies['By Actors'].push(movie);
                    });
                    directorList.forEach(function(movie) {
                        if (!movies['By Director']) {
                            movies['By Director'] = [];
                        }

                        movies['By Director'].push(movie);
                    });

                    //use the index page to display search results in the same
                    //layout as the main browse page
                    response.render('pages/index', {
                        pageTitle: 'Search Results',
                        pageHeader: 'Search Results',
                        movies: movies,
                        user: response.locals.user,
                        watchOptions: config.serverConfig.watchOptions
                    });
                });
            });
        });
    });
});

app.post('/api/movies/submit', function (request, response) {
    movieData.addMovie(request.body.title, request.body.year).then(function (res) {
        response.redirect('/movie/' + res._id);
    });
});

app.post('/api/movies/:id/vote', function (request, response) {
    var rating = parseInt(request.body.rating);
    var id = request.params.id;

    movieData.voteOnMovie(id, rating, response.locals.user._id).then(function (res) {
        response.json({ success: true });
    }).catch(function (err) {
        response.json({ success: false });
    });
});

/** User routes **/
app.post('/login', function (request, response) {
    if (response.locals.user !== null) {
        response.redirect('/');
    }

    userData.getPassHash(request.body.username).then(function (passHash) {
        userData.login(
                request.body.username,
                bcrypt.compareSync(request.body.password, passHash),
                response
        ).then(function (valid) {
            response.redirect('/');
        }).catch(function (err) {
            response.redirect('/login');
        });
    }).catch(function (err) {
        response.redirect('/login');
    });
});

app.post('/register', function (request, response) {
    if (response.locals.user !== null) {
        response.redirect('/');
    }

    if (
        request.body.username.trim() === '' ||
        request.body.password.trim() === '' ||
        request.body.realname.trim() === ''
    ) {
        return response.redirect('/');
    }

    userData
        .createUser(
            request.body.username.trim(),
            bcrypt.hashSync(request.body.password.trim()),
            request.body.realname.trim()
        ).then(function (data) {
            response.redirect('/');
        }).catch(function (err) {
            response.redirect('/');
        });
});

app.get('/logout', function (request, response) {
    if (response.locals.user === null) {
        response.redirect('/');
    }

    userData
        .logout(request.cookies[config.serverConfig.cookieName], response)
        .then(function (res) {
            response.locals.user = null;
            response.redirect('/');
        });
});

app.get('/login', function (request, response) {
    response.render('pages/login', { title: 'Login' });
});

app.get('/profile', function (request, response) {
    userData
        .getAllMovies(response.locals.user._id)
        .then(movieData.getMoviesByIDs)
        .then(function (moviesList) {
            response.render(
                'pages/profile',
                { user: response.locals.user, movies: moviesList }
            );
        });
});

app.get('/profile/:username', function (request, response) {
    userData.getUserByUsername(request.params.username).then(function (profile) {
        if (!profile) {
            response.redirect('/profile');
        } else {
            userData.getAllMovies(profile._id)
            .then(movieData.getMoviesByIDs)
            .then(function (moviesList) {
                response.render(
                    'pages/profile',
                    { user: profile, movies: moviesList }
                );
            });
        }
    });
});

app.get('/settings', function (request, response) {
    response.render('pages/settings', { user: response.locals.user });
});

app.get('/movies/my', function (request, response) {
    userData
        .getAllMovies(response.locals.user._id)
        .then(movieData.getMoviesByIDs)
        .then(function (moviesList) {
            response.render(
                'pages/myMovies',
                { user: response.locals.user, movies: moviesList }
            );
        });
});

app.post('/api/user/removeMovie', function (request, response) {
    var movieID = request.body.id;

    userData.removeMovie(movieID, response.locals.user._id).then(function (res) {
        response.json({ success: true });
    });
});

app.post('/api/user/update', function (request, response) {
    var uid = response.locals.user._id;
    var profile = request.body.profileText;
    var realname = request.body.realName;
    var password = request.body.password;
    var passConfirm = request.body.passwordConfirm;

    if (!uid || !realname) {
        console.log('Something went wrong');
        response.redirect('/settings');
        return;
    }

    var newPass = (password && password == passConfirm)
                                ? bcrypt.hashSync(password.trim())
                                : null;

    userData
        .updateProfile(uid, profile, realname, newPass)
        .then(function (res) {
            if (newPass) {
                response.redirect('/logout');
            } else {
                response.redirect('/profile');
            }
        });
});

app.post('/movies/my/feature/:id', function (request, response) {
    var mid = request.params.id;
    var uid = response.locals.user._id;
    if(!mid || !uid) {
        console.log('Something went wrong');
        response.json({ err: 'Invalid parameters' });
    } else {
        userData.setFeaturedMovie(uid, mid).then(function (res) {
            if (res === true) {
                response.json();
            } else {
                response.json({ err: res });
            }
        }).catch(function (err) {
            console.log(err);
            response.json({ err: err });
        });
    }
});

app.post('/api/user/watchMovie/:id', function (request, response) {
    var id = request.params.id;
    var uid = response.locals.user._id;
    var state = request.body.state;

    if (!id || !uid || !state) {
        console.log('Something went wrong');
        response.json({ err: 'Invalid parameters' });
    } else {
        userData.watchMovie(id, uid, state).then(function (res) {
            if (res === true) {
                response.json();
            } else {
                response.json({ err: res });
            }
        }).catch(function (err) {
            console.log(err);
            response.json({ err: err });
        });
    }
});

// Fallback for invalid routes
app.get('*', function (request, response) {
    response.redirect('/');
});

// We can now navigate to localhost:3000
app.listen(3000, function() {
    console.log('Server up and running on port 3000');
});
