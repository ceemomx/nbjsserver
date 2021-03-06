var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var robber = {};

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/crab', function (req, res) {
    if(req.query.domain && !/baidu/.test(req.query.domain)){
        if(robber[req.query.domain]){
            robber[req.query.domain]['hot'] = ++robber[req.query.domain]['hot'];
            robber[req.query.domain]['level'] = req.query.level;
        }else{
            robber[req.query.domain] = {
                level:req.query.level,
                title:(req.query.domain).replace(/^www\./, '').split('.')[0],
                hot:1,
                updateAt:Date.now()
            }
        }
    }
    res.status(200);
    res.end();
});

app.use(function (req, res, next) {
    if(req.url == '/web.json'){
        next();
    }else{
        var date = (new Date()).getHours();
        if ((date >= 17 && date <= 23) || (date >= 0 && date < 9 )) {
            res.set({
                'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
            });
            res.status(200);
            res.end();
        } else {
            res.set({
                'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
            });
            next();
        }
    }
});

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.use(express.static(path.join(__dirname, 'public')));



app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

var recorder = setInterval(function(){
    fs.rename(`${__dirname}/public/web.json`, `${__dirname}/public/data/${Date.now() - 1000 * 60}.json`, function(err){
        fs.writeFile(`${__dirname}/public/web.json`, JSON.stringify(robber), function(err){
            console.log('write error:',err)
        });
    })
},1000 * 60);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
