var express = require('express');
var bodyParser = require('body-parser');
var movieData = require('./data.js');
var userData = require('./users.js');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');
var config = require('./config.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use('/assets', express.static('static'));

// Routes that only authenticated users can view
// Supports regex
var restrictedRoutes = [ /\/profile*/, /\/settings*/, /\/movies\/my*/, /\/api\/user*/, /\/api\/movies*/, /\/submit*/ ];

app.use(function (request, response, next) {
    var cookieVal = (request.cookies !== undefined) ? request.cookies[config.serverConfig.cookieName] : null;
    url = request.url;

    userData.isLoggedIn(cookieVal, response).then(function (res) {
        if (res !== null && cookieVal !== undefined) {
            response.locals.user = res;
        } else {
            response.locals.user = null;
            restrictedRoutes.forEach(function (route) {
                if (route.test(url)) {
                    response.redirect("/");
                }
            });
        }

        next();
    });
});

app.get("/", function (request, response) {
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

        response.render("pages/index", { 
            pageTitle: 'Browse', 
            movies: movies, 
            user: response.locals.user,
            watchOptions: config.serverConfig.watchOptions
        });
    });
});

app.get("/submit", function (request, response) {
    response.render("pages/submitMovie", { user: response.locals.user });
});

app.post("/api/movies/submit", function (request, response) {
    movieData.addMovie(request.body.title, request.body.year);
    response.redirect("/");
});

/** User management routes **/
app.post("/login", function (request, response) {
    if (response.locals.user !== null) {
        response.redirect("/");
    }

    userData.getPassHash(request.body.username).then(function (passHash) {
        userData.login(request.body.username, bcrypt.compareSync(request.body.password, passHash), response).then(function (valid) {
            response.redirect("/");
        }).catch(function (err) {
            response.redirect("/login");
        });
    }).catch(function (err) {
        response.redirect("/login");
    });
});

app.post("/register", function (request, response) {
    if (response.locals.user !== null) {
        response.redirect("/");
    }

    if (request.body.username.trim() === "" || request.body.password.trim() === "" || request.body.realname.trim() === "") {
        response.redirect("/");
        return;
    }

    userData.createUser(request.body.username.trim(), bcrypt.hashSync(request.body.password.trim()), request.body.realname.trim()).then(function (data) {
        response.redirect("/");
    }).catch(function (err) {
        response.redirect("/");
    });
});

app.get("/logout", function (request, response) {
    if (response.locals.user === null) {
        response.redirect("/");
    }

    userData.logout(request.cookies[config.serverConfig.cookieName], response).then(function (res) {
        response.locals.user = null;
        response.redirect("/");
    });
});

app.get("/login", function (request, response) {
    response.render("pages/login", { title: "Login" });
});

app.get('/profile', function (request, response) {
    userData.getAllMovies(response.locals.user._id).then(function (movies) {
        response.render('pages/profile', { user: response.locals.user, movies: movies });
    });
});

app.get('/settings', function (request, response) {
    response.render('pages/settings', { user: response.locals.user });
});

app.post('/api/user/update', function (request, response) {
    var uid = response.locals.user._id;
    var profile = request.body.profileText;
    var realname = request.body.realName;
    var password = request.body.password;
    var passConfirm = request.body.passwordConfirm;

    if (!uid || !realname) {
        console.log("Something went wrong");
        response.redirect("/settings");
        return;
    }

    var newPass = (password && password == passConfirm) ? bcrypt.hashSync(password.trim()) : null;

    userData.updateProfile(uid, profile, realname, newPass).then(function (res) {
        if (newPass) {
            response.redirect("/logout");
        } else {
            response.redirect("/profile");
        }
    });
});

app.post('/api/user/watchMovie/:id', function (request, response) {
    var id = request.params.id;
    var uid = response.locals.user._id;
    var state = request.body.state;

    if (!id || !uid || !state) {
        console.log("Something went wrong");
        response.json({ err: "Invalid parameters" });
    } else {
        userData.watchMovie(id, uid, state).then(function (response) {
            if (response === true) {
                response.json();
            } else {
                response.json({ err: response });
            }
        }).catch(function (err) {
            console.log(err);
            response.json({ err: err });
        });
    }
});

app.get('*', function (request, response) {
    response.redirect("/");
});

// We can now navigate to localhost:3000
app.listen(3000, function() {
    console.log('Server up and running on port 3000');
});
