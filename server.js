// We first require our express package
var express = require('express');
var bodyParser = require('body-parser');
var movieData = require('./data.js');

// We create our express isntance:
var app = express();

app.use(bodyParser.json()); // for parsing application/json

app.set('view engine', 'ejs');
app.use('/assets', express.static('static'));

// If you'll notice, there's not a single database call in the server file!
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
        response.render("pages/index", { movies: genres });
    });
});

// Get the best movies
app.get('/api/movies/best', function(request, response) {
    movieData
        .getPopularMovies()
        .then(function(popularMovies){
            response.json(popularMovies);
        });
});

// Get a single movie
app.get('/api/movies/:id', function(request, response) {
    movieData.getMovie(request.params.id).then(function(movie) {
        response.json(movie);
    }, function(errorMessage) {
        response.status(500).json({ error: errorMessage });
    });
});

// Get all the movies
app.get('/api/movies', function(request, response) {
    movieData.getAllMovies().then(function(movieList) {
        response.json(movieList);
    });
});

// Create a movie
app.post('/api/movies', function(request, response) {
    movieData.createMovie(request.body.title, request.body.rating).then(function(movie) {
        response.json(movie);
    }, function(errorMessage) {
        response.status(500).json({ error: errorMessage });
    });
});

// Update a movie 
app.put('/api/movies/:id', function(request, response) {
    movieData.updateMovie(request.params.id, request.body.title, request.body.rating).then(function(movie) {
        response.json(movie);
    }, function(errorMessage) {
        response.json({ error: errorMessage });
    });
});

app.delete('/api/movies/:id', function(request, response) {
    movieData.deleteMovie(request.params.id).then(function(status) {
        response.json({success: status});
    }, function(errorMessage) {
        response.json({ error: errorMessage });
    });
});

// Get a user's profile
app.get('/profile', function (request, response) {
    // TODO: Send data with this
    response.render('pages/profile');
});

// We can now navigate to localhost:3000
app.listen(3000, function() {
    console.log('Server up and running on port 3000');
});
