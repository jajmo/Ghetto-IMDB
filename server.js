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
var restrictedRoutes = [ /\/profile*/, /\/settings*/, /\/movies\/my*/, /\/api\/user*/ ];

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
    var genres = [
        {
            genre: "Sci-Fi",
            movies: [
                {
                    _id: 1,
                    title: "Ex-Machina",
                    image: "http://www.joblo.com/posters/images/full/ex-machina-poster.jpg"
                },
                {
                    _id: 2,
                    title: "The Matrix",
                    image: "http://www.coverwhiz.com/content/The-Matrix.jpg"
                },
                {
                    _id: 3,
                    title: "Alien",
                    image: "http://www.pxleyes.com/images/contests/movie-poster-recreation/fullsize/movie-poster-recreation-52953fe575c29.jpg"
                },
                {
                    _id: 4,
                    title: "Star Wars: The Force Awakens",
                    image: "https://milnersblog.files.wordpress.com/2016/03/star-wars-the-force-awakens-dvd-box-cover-artwork1.jpg"
                },
                {
                    _id: 5,
                    title: "The Terminator",
                    image: "https://s-media-cache-ak0.pinimg.com/736x/9f/22/5e/9f225e7f09852e9400d58cf6e712eeee.jpg"
                },
                {
                    _id: 6,
                    title: "Prometheus",
                    image: "http://1.bp.blogspot.com/-_mKfatjsC6s/ULl1sCNWCLI/AAAAAAAAGt0/-xv3BwxvC9s/s1600/prometheus-movie-wallpaper-10.jpg"
                },
                {
                    _id: 7,
                    title: "Moon",
                    image: "https://upload.wikimedia.org/wikipedia/en/b/b0/Moon_(2008)_film_poster.jpg"
                }
            ]
        },
        {
            genre: "Action",
            movies: [
                {
                    _id: 8,
                    title: "The Avengers",
                    image: "http://www.coverwhiz.com/content/The-Avengers.jpg"
                }
            ]
        }
    ]
    movieData.getAllMovies().then(function (movies) {
        response.render("pages/index", { 
            pageTitle: 'Browse', 
            movies: genres, 
            user: response.locals.user,
            watchOptions: config.serverConfig.watchOptions
        });
    });
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
