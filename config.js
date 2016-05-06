var exports = module.exports = {};

exports.mongoConfig = {
    serverUrl: 'mongodb://localhost:27017/',
    database: 'ghetto_imdb'
};

exports.serverConfig = {
    metadataSource: '',
    watchOptions: {
        notWatched: 1,
        watched: 2,
        willNotWatch: 3
    },
    cookieName: 'sessID'
};
